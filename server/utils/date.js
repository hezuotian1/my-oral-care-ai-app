/** 本地日期字符串 YYYY-MM-DD */
function todayStr(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function shiftDays(d, n) {
  const copy = new Date(d.getTime())
  copy.setDate(copy.getDate() + n)
  return copy
}

/**
 * 计算连续打卡天数。
 * 从今天开始向前数；若今天未打卡，则从昨天开始（保留「昨天打过、今天还没打」的连续记录）。
 */
function computeStreak(dateList, now = new Date()) {
  const set = new Set(dateList)
  let cursor = new Date(now.getTime())
  if (!set.has(todayStr(cursor))) {
    cursor = shiftDays(cursor, -1)
    if (!set.has(todayStr(cursor))) return 0
  }
  let streak = 0
  while (set.has(todayStr(cursor))) {
    streak++
    cursor = shiftDays(cursor, -1)
  }
  return streak
}

module.exports = { todayStr, shiftDays, computeStreak }
