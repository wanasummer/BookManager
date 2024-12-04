// 日期格式化函数
export function formatDate(date) {
    if (!date) return '-'; // 如果日期为空，返回占位符
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // 月份补零
    const day = String(d.getDate()).padStart(2, '0'); // 日期补零
    return `${year}-${day}-${month}`;
  }