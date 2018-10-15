import SnuOwnd from 'snuownd'

const markdown = SnuOwnd.getParser()

// Flatten arrays one level
export const flatten = arr => arr.reduce(
  (accumulator, value) => accumulator.concat(value),
  []
)

// Take on big array and split it into an array of chunks with correct size
export const chunk = (arr, size) => {
  const chunks = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

// Change bases
export const toBase36 = number => parseInt(number, 10).toString(36)
export const toBase10 = numberString => parseInt(numberString, 36)

// Reddits way of indicating that something is deleted (the '\\' is for Reddit and the other is for pushshift)
export const isDeleted = textBody => textBody === '\\[deleted\\]' || textBody === '[deleted]'

// Reddits way of indicating that something is deleted
export const isRemoved = textBody => textBody === '\\[removed\\]' || textBody === '[removed]'

export const isComment = item => {
  return item.name.slice(0,2) === 't1'
}

export const isPost = item => {
  return item.name.slice(0,2) === 't3'
}

export const itemIsRemovedOrDeleted = item => {
  if (item.name.slice(0,2) === 't1') {
    return item.body.replace(/\\/g,'') === '[removed]' && item.author.replace(/\\/g,'') === '[deleted]'
  } else if (item.name.slice(0,2) === 't3') {
    return ! item.is_robot_indexable
  }
}

export const postIsDeleted = post => {
  if (itemIsRemovedOrDeleted(post)) {
    return post.author.replace(/\\/g,'') === '[deleted]'
  }
  return false
}

// Default thumbnails for reddit threads
export const redditThumbnails = ['self', 'default', 'image', 'nsfw']

// Parse comments
export const parse = text => markdown.render(text)

// UTC to "Reddit time format" (e.g. 5 hours ago, just now, etc...)
export const prettyDate = createdUTC => {
  const currentUTC = Math.floor((new Date()).getTime() / 1000)
  const secondDiff = currentUTC - createdUTC
  const dayDiff = Math.floor(secondDiff / 86400)

  if (dayDiff < 0) return ''
  if (dayDiff === 0) {
    if (secondDiff < 10) return 'just now'
    if (secondDiff < 60) return `${secondDiff} seconds ago`
    if (secondDiff < 120) return 'a minute ago'
    if (secondDiff < 3600) return `${Math.floor(secondDiff / 60)} minutes ago`
    if (secondDiff < 7200) return 'an hour ago'
    if (secondDiff < 86400) return `${Math.floor(secondDiff / 3600)} hours ago`
  }
  if (dayDiff < 7) return `${dayDiff} days ago`
  if (dayDiff < 31) return `${Math.floor(dayDiff / 7)} weeks ago`
  if (dayDiff < 365) return `${Math.floor(dayDiff / 30)} months ago`
  return `${Math.floor(dayDiff / 365)} years ago`
}

// Reddit format for scores, e.g. 12000 => 12k
export const prettyScore = score => {
  if (score >= 100000) {
    return `${(score / 1000).toFixed(0)}k`
  } else if (score >= 10000) {
    return `${(score / 1000).toFixed(1)}k`
  }

  return score
}

// Retrieve, store and delete stuff in the local storage
export const get = (key, defaultValue) => {
  const value = window.localStorage.getItem(key)
  return value !== null ? JSON.parse(value) : defaultValue
}

export const put = (key, value) => window.localStorage.setItem(key, JSON.stringify(value))

// Sorting for comments
export const topSort = (commentA, commentB) => {
  if (commentA.score > commentB.score) return -1
  if (commentA.score < commentB.score) return 1
  return 0
}

export const bottomSort = (commentA, commentB) => {
  if (commentA.score < commentB.score) return -1
  if (commentA.score > commentB.score) return 1
  return 0
}

export const newSort = (commentA, commentB) => {
  if (commentA.created_utc > commentB.created_utc) return -1
  if (commentA.created_utc < commentB.created_utc) return 1
  return 0
}

export const oldSort = (commentA, commentB) => {
  if (commentA.created_utc < commentB.created_utc) return -1
  if (commentA.created_utc > commentB.created_utc) return 1
  return 0
}

// Filter comments
export const showRemoved = comment => comment.removed === true
export const showDeleted = comment => comment.deleted === true
export const showRemovedAndDeleted = comment => comment.removed === true || comment.deleted === true
