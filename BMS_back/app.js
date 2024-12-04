const express = require("express");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// 数据库连接
const db_config = {
  host: "localhost",
  user: "root",
  password: "123456",
  database: "cloudlibrary",
}

let db;

function handleDisconnect() {
  db = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  db.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  db.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

// JWT 密钥
const SECRET_KEY = "liumingxin";
const whiteList = ["/api/login", "/api/register"];

// JWT 验证中间件
const verifyToken = (req, res, next) => {
  if (whiteList.includes(req.path)) {
    return next();  // 如果请求路径在白名单中，直接通过
  }

  const token = req.headers.authorization?.split(' ')[1]; // 从请求头获取 token
  if (!token) {
    return res.status(401).send({ code: 401, msg: "未提供 Token" });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({ code: 401, msg: "Token 无效" });
    }
    req.user = decoded; // 将解码后的用户信息存入请求对象
    next();
  });
};

// 应用 JWT 验证中间件
app.use(verifyToken);

// 登录接口
app.post("/api/login", (req, res) => {
  const { user_email, user_password } = req.body;
  const queryParams = [user_email, user_password];
  const sqlStr = `SELECT user_id, user_name, user_role FROM user WHERE user_email = ? AND user_password = ? and user_status = 0`;
  db.query(sqlStr, queryParams, (err, results) => {
    if (err) return res.status(500).send({ code: 500, msg: "服务器错误：" + err.message });
    if (results.length === 0) {
      res.status(401).send({
        code: 401,
        msg: "用户名或密码错误"
      });
    } else {
      const user = results[0];
      // 生成 JWT Token
      const token = jwt.sign(
        { user_id: user.user_id, user_role: user.user_role },  // 载荷
        SECRET_KEY,  // 密钥
        { expiresIn: "7d" }  // 有效期
      );

      res.send({
        status: 200,
        data: {
          user_id: user.user_id,
          user_name: user.user_name,
          user_role: user.user_role,
          token: token  // 返回 token
        },
        msg: "登录成功"
      });
    }
  });
});

// 注册接口
app.post('/api/register', (req, res) => {
  const { user_name, user_email, user_password } = req.body;

  // 检查必填字段
  if (!user_name || !user_email || !user_password) {
    return res.status(400).send({ code: 400, msg: '请填写所有必填字段' });
  }

  // 检查用户是否已存在
  const checkUserSql = `SELECT * FROM user WHERE user_email = ?`;
  db.query(checkUserSql, [user_email], (err, results) => {
    if (err) {
      return res.status(500).send({ code: 500, msg: '服务器错误：' + err.message });
    }

    if (results.length > 0) {
      return res.status(409).send({ code: 409, msg: '该邮箱已被注册' });
    }

    // 插入新用户信息的 SQL 语句
    const insertUserSql = `
      INSERT INTO user (user_name, user_email, user_password, user_role, user_status, created_at)
      VALUES (?, ?, ?, 'user',0,NOW())
    `;
    const sqlParams = [user_name, user_email, user_password];

    // 执行 SQL 查询
    db.query(insertUserSql, sqlParams, (err, results) => {
      if (err) {
        return res.status(500).send({ code: 500, msg: '服务器错误：' + err.message });
      }

      // 成功响应
      res.send({
        code: 200,
        msg: '注册成功！',
        data: { user_id: results.insertId } // 返回新用户的ID
      });
    });
  });
});

//  获取图书列表
app.get("/api/getBookInfo", (req, res) => {
  let status = req.query.status ? 0 : 1
  console.log(req.query)
  let baseSql = `SELECT book_id, book_name, book_isbn, book_press, book_author, book_pagination, book_price, book_status,booking_id FROM book`;
  let countSql = `SELECT COUNT(*) AS total FROM book`;
  const whereClauses = [`(is_deleted != 1 or is_deleted is null) and book_status != ${status}`];
  const queryParams = [];

  // 动态添加查询条件
  if (req.query.book_name) {
    whereClauses.push(`book_name LIKE ?`);
    queryParams.push(`%${req.query.book_name}%`);
  }
  if (req.query.book_isbn) {
    whereClauses.push(`book_isbn LIKE ?`);
    queryParams.push(req.query.book_isbn);
  }
  if (req.query.book_press) {
    whereClauses.push(`book_press LIKE ?`);
    queryParams.push(req.query.book_press);
  }
  if (req.query.book_author) {
    whereClauses.push(`book_author LIKE ?`);
    queryParams.push(`%${req.query.book_author}%`);
  }

  const whereSql = whereClauses.length > 0 ? ' WHERE ' + whereClauses.join(' AND ') : '';

  // 分页参数
  const pageSize = parseInt(req.query.pageSize) || 10; // 每页大小，默认 10 条
  const pageNum = parseInt(req.query.pageNum) || 1; // 当前页码，默认第 1 页
  const offset = (pageNum - 1) * pageSize; // 偏移量

  // 拼接完整 SQL 语句（分页查询）
  const finalSql = `${baseSql} ${whereSql} LIMIT ? OFFSET ?`;
  queryParams.push(pageSize, offset);

  db.query(`${countSql} ${whereSql}`, queryParams.slice(0, -2), (err, countResults) => {
    if (err) {
      console.error('获取总数失败:', err);
      return res.status(500).json({ message: '获取总数失败', error: err.message });
    }
    const total = countResults[0].total; // 获取总条目数

    db.query(finalSql, queryParams, (err, results) => {
      if (err) return res.status(500).send("错误：" + err.message);
      res.json({
        total,
        data: results.length ? results : [] // 如果没有结果，返回空数组
      });
    });
  });
});

// 图书借阅功能
app.post('/api/book_borrow', (req, res) => {
  const { book_borrower, user_id, book_id } = req.body;
  // 首先检查书籍是否已被借出
  const checkSql = `SELECT book_borrower, booking_id FROM book WHERE book_id = ?`;
  db.query(checkSql, [book_id], (err, results) => {
    if (err) return res.status(500).send({ code: 500, msg: '服务器错误：' + err.message });
    if (results.length === 0) {
      return res.status(404).send({ code: 404, msg: '未找到该书籍' });
    }
    if (results[0].book_borrower) {
      return res.status(400).send({ code: 400, msg: '该书已被借出' });
    }
    if (results[0].booking_id === user_id) {
      // 更新书籍信息，设置借阅者和借阅时间
      const sqlStr = `UPDATE book SET book_borrower = ?, book_borrowtime = NOW(), book_status = 1 WHERE book_id = ?`;
      db.query(sqlStr, [book_borrower, book_id], (err, results) => {
        if (err) return res.status(500).send({ code: 500, msg: '服务器错误：' + err.message });
        if (results.affectedRows === 0) {
          return res.status(400).send({ code: 400, msg: '借阅失败，请重试' });
        }
        res.send({
          status: 200,
          msg: '借阅成功！'
        });
      });
    } else {
      res.send({
        msg: '您还未预约！'
      })
    }
  });
});

// 图书归还
app.post('/api/book_return', (req, res) => {
  const { book_id } = req.body;

  // 检查书籍是否已被借出
  const checkSql = `SELECT book_borrower FROM book WHERE book_id = ?`;
  db.query(checkSql, [book_id], (err, results) => {
    if (err) return res.status(500).send({ code: 500, msg: '服务器错误：' + err.message });

    if (results.length === 0) {
      return res.status(404).send({ code: 404, msg: '未找到该书籍' });
    }

    if (!results[0].book_borrower) {
      return res.status(400).send({ code: 400, msg: '该书未被借出，无需归还' });
    }

    // 更新书籍信息，清除借阅者并设置归还时间
    const sqlStr = `UPDATE book SET book_borrower = NULL, book_borrowtime = NULL, book_returntime = NOW(), book_status = 0, booking_id = null WHERE book_id = ?`;
    db.query(sqlStr, [book_id], (err, results) => {
      if (err) return res.status(500).send({ code: 500, msg: '服务器错误：' + err.message });

      if (results.affectedRows === 0) {
        return res.status(400).send({ code: 400, msg: '归还失败，请重试' });
      }

      res.send({
        status: 200,
        msg: '归还成功！'
      });
    });
  });
});

//图书预约功能
app.post('/api/booking', (req, res) => {
  const { book_id, user_id } = req.body;
  const selectSqlStr = `select book_status from book where book_id = ?`;
  db.query(selectSqlStr, [book_id], (err, results) => {
    if (err) return res.send(err.message);
    if (results[0].status !== 1) {
      const sqlStr = `update book set booking_id = ? where book_id = ?`;
      db.query(sqlStr, [user_id, book_id], (err, results) => {
        if (err) return res.send(err.message);
        res.send({
          status: 200,
          msg: '已预约！请尽快借阅'
        })
      })
    } else {
      res.send({
        msg: '图书已被借阅！请在归还后借阅！'
      })
    }
  })
})

// 编辑图书信息（管理员可以操作）
app.post('/api/updateBookInfo', (req, res) => {
  const { book_id, book_name, book_isbn, book_press, book_author, book_pagination, book_price } = req.body;
  // 检查必填字段
  if (!book_id || !book_name || !book_isbn || !book_press || !book_author || !book_pagination || !book_price) {
    return res.status(400).send({ code: 400, msg: '请填写所有必填字段' });
  }
  // 更新图书信息的 SQL 语句
  const sqlStr = `
    UPDATE book
    SET book_name = ?, book_isbn = ?, book_press = ?, book_author = ?, book_pagination = ?, book_price = ?
    WHERE book_id = ?
  `;
  const sqlParams = [book_name, book_isbn, book_press, book_author, book_pagination, book_price, book_id];
  // 执行 SQL 查询
  db.query(sqlStr, sqlParams, (err, results) => {
    if (err) {
      return res.status(500).send({ code: 500, msg: '服务器错误：' + err.message });
    }
    // 检查是否有记录被更新
    if (results.affectedRows === 0) {
      return res.status(404).send({ code: 404, msg: '未找到要更新的图书或更新失败' });
    }
    // 成功响应
    res.send({
      code: 200,
      msg: '图书信息更新成功！'
    });
  });
});

// 添加图书（管理员可以显示前端）
app.post('/api/addBook', (req, res) => {
  const { book_name, book_isbn, book_press, book_author, book_pagination, book_price } = req.body;

  // 检查必填字段
  if (!book_name || !book_isbn || !book_press || !book_author || !book_pagination || !book_price) {
    return res.status(400).send({ code: 400, msg: '请填写所有必填字段' });
  }

  // 插入图书信息的 SQL 语句
  const sqlStr = `
    INSERT INTO book (book_name, book_isbn, book_press, book_author, book_pagination, book_price,book_uploadtime)
    VALUES (?, ?, ?, ?, ?, ?,NOW())
  `;

  const sqlParams = [book_name, book_isbn, book_press, book_author, book_pagination, book_price];

  // 执行 SQL 查询
  db.query(sqlStr, sqlParams, (err, results) => {
    if (err) {
      return res.status(500).send({ code: 500, msg: '服务器错误：' + err.message });
    }

    // 成功响应
    res.send({
      code: 200,
      msg: '图书添加成功！',
      data: { book_id: results.insertId } // 返回新图书的ID
    });
  });
});

// 删除图书（支持批量删除）(管理员可以操作)
app.delete('/api/delete', (req, res) => {
  const { book_id } = req.body;

  // 检查是否传入了 book_id，并确保它是一个数组或字符串
  if (!book_id || (Array.isArray(book_id) && book_id.length === 0)) {
    return res.status(400).send({ code: 400, msg: '请提供要删除的图书 ID' });
  }

  // 构造 SQL 语句，将数组转换为逗号分隔字符串
  const sqlStr = `UPDATE book SET is_deleted = 1 WHERE book_id IN (?)`;

  // 执行 SQL 查询
  db.query(sqlStr, [book_id], (err, results) => {
    if (err) {
      return res.status(500).send({ code: 500, msg: '服务器错误：' + err.message });
    }

    // 检查受影响的行数
    if (results.affectedRows === 0) {
      return res.status(404).send({ code: 404, msg: '未找到指定的图书或图书已删除' });
    }

    // 成功响应
    res.send({
      code: 200,
      msg: '图书删除成功！',
      data: { affectedRows: results.affectedRows } // 返回受影响的行数
    });
  });
});

// 获取用户列表（管理员登录可以显示前端页面）
app.get('/api/getUserList', (req, res) => {
  const { user_name, user_email, user_status, created_at, pageNum, pageSize } = req.query;

  // 设置默认的页码和每页大小
  const page = pageNum || 1;  // 默认为第1页
  const size = pageSize || 10;  // 默认为每页10条

  // 计算 OFFSET，用于分页查询
  const offset = (page - 1) * size;

  // 初始化查询条件
  let whereClauses = [];
  let params = [];

  if (user_name) {
    whereClauses.push('user_name LIKE ?');
    params.push(`%${user_name}%`);
  }

  if (user_email) {
    whereClauses.push('user_email LIKE ?');
    params.push(`%${user_email}%`);
  }

  if (user_status) {
    whereClauses.push('user_status = ?');
    params.push(user_status);
  }

  if (created_at) {
    whereClauses.push('created_at >= ?');
    params.push(created_at);
  }

  // 构建 SQL 查询
  let sqlStr = 'SELECT user_id,user_name,user_email,user_role,user_status,created_at FROM user';

  // 如果有查询条件，添加 WHERE 子句
  if (whereClauses.length > 0) {
    sqlStr += ' WHERE ' + whereClauses.join(' AND ');
  }

  // 添加分页查询
  sqlStr += ' LIMIT ? OFFSET ?';
  params.push(parseInt(size), parseInt(offset));

  // 执行查询
  db.query(sqlStr, params, (err, results) => {
    if (err) {
      console.log(sqlStr,params)
      return res.status(500).send({ code: 500, msg: '服务器错误：' + err.message });
    }
    // 查询总记录数，用于计算总页数
    const countSql = 'SELECT COUNT(*) AS total FROM user' + (whereClauses.length > 0 ? ' WHERE ' + whereClauses.join(' AND ') : '');
    db.query(countSql, params.slice(0, params.length - 2), (err, countResults) => {
      if (err) {
        return res.status(500).send({ code: 500, msg: '服务器错误：' + err.message });
      }

      const total = countResults[0].total;
      const totalPages = Math.ceil(total / size);  // 总页数

      res.send({
        code: 200,
        msg: '用户列表查询成功',
        data: results,
        total,  // 总记录数
        totalPages,  // 总页数
        pageNum: page,  // 当前页
        pageSize: size  // 每页大小
      });
    });
  });
});

// 封禁用户（支持多个账户同时封禁）
// 只有管理员可以访问此接口
app.post('/api/ban', (req, res) => {
  const { user_id } = req.body;

  // 检查是否传入了用户ID
  if (!user_id || !Array.isArray(user_id) || user_id.length === 0) {
    return res.status(400).send({ code: 400, msg: '请提供有效的用户ID列表' });
  }

  // 构建 SQL 查询语句，将 user_id 列表传递给 IN (?) 子句
  const sqlStr = `UPDATE user SET user_status = 1 WHERE user_id IN (?)`;

  // 执行 SQL 查询
  db.query(sqlStr, [user_id], (err, results) => {
    if (err) {
      return res.status(500).send({ code: 500, msg: '服务器错误：' + err.message });
    }

    // 检查更新操作是否有影响行数
    if (results.affectedRows === 0) {
      return res.status(404).send({ code: 404, msg: '没有找到需要封禁的用户' });
    }

    // 成功响应
    res.send({
      code: 200,
      msg: '用户封禁成功',
      data: { affectedRows: results.affectedRows } // 返回封禁的用户数
    });
  });
});


app.listen(3000, () => {
  console.log("服务器正在监听 http://127.0.0.1:3000")
})
handleDisconnect();