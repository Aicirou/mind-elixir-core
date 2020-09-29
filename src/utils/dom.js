import { LEFT, RIGHT, SIDE } from '../const'
import vari from '../var'

// DOM manipulation
let $d = document
export let findEle = id => {
  return $d.querySelector(`[data-nodeid=me${id}]`)
}

export let createGroup = function (node) {
  let grp = $d.createElement('GRP')
  let top = createTop(node)
  grp.appendChild(top)
  if (node.children && node.children.length > 0) {
    top.appendChild(createExpander(node.expanded))
    if (node.expanded !== false) {
      let children = createChildren(node.children)
      grp.appendChild(children)
    }
  }
  return { grp, top }
}

export let createTop = function (nodeObj) {
  let top = $d.createElement('t')
  let n = $d.createElement('ng')
  let ngl = $d.createElement('ngl')
  let ngr = $d.createElement('ngr')
  let tpc = createTopic(nodeObj)
  // TODO allow to add online image
  if (nodeObj.style) {
    tpc.style.color = nodeObj.style.color
    tpc.style.background = nodeObj.style.background
    tpc.style.fontSize = nodeObj.style.fontSize + 'px'
    tpc.style.fontWeight = nodeObj.style.fontWeight || 'normal'
  }
  if (nodeObj.icons) {
    let iconsContainer = $d.createElement('span')
    iconsContainer.className = 'icons'
    iconsContainer.innerHTML = nodeObj.icons
      .map(icon => `<span>${icon}</span>`)
      .join('')
    tpc.appendChild(iconsContainer)
  }
  ngl.appendChild(tpc)
  if (nodeObj.tags) {
    let tagsContainer = $d.createElement('div')
    tagsContainer.className = 'tags'
    tagsContainer.innerHTML = nodeObj.tags
      .map(tag => `<span class="tag_${tag.type}">${tag.text}</span>`)
      .join('')
    ngl.appendChild(tagsContainer)
  }
  if (nodeObj.linkUrl) {
    let link = $d.createElement('a')
    if (window.merouter && nodeObj.linkUrl.indexOf('http') < 0) {
      link.onclick = function () {
        window.merouter(nodeObj.linkUrl)
      }
    } else {
      link.onclick = function () {
        window.open(nodeObj.linkUrl)
      }
    }
    link.className = 'topic_link'
    link.innerHTML = `<svg class="icon" aria-hidden="true">
                        <use xlink:href="#icon-link"></use>
                      </svg>`
    ngr.appendChild(link)
  }
  n.appendChild(ngl)
  n.appendChild(ngr)
  top.appendChild(n)
  return top
}

export let createTopic = function (nodeObj) {
  let topic = $d.createElement('tpc')
  topic.nodeObj = nodeObj
  topic.dataset.nodeid = 'me' + nodeObj.id
  topic.draggable = vari.mevar_draggable
  createTopicText(topic, nodeObj)
  return topic
}

export let createTopicText = function (topic, nodeObj) {
  if(!nodeObj.topic){
    return
  }
  const texts = nodeObj.topic.split(/\n/)
  texts.forEach(text => {
    let textEl = $d.createElement('text')
    textEl.innerText = text
    topic.appendChild(textEl)
  })
}

export function selectText(div) {
  if ($d.selection) {
    let range = $d.body.createTextRange()
    range.moveToElementText(div)
    range.select()
  } else if (window.getSelection) {
    let range = $d.createRange()
    range.selectNodeContents(div)
    window.getSelection().removeAllRanges()
    window.getSelection().addRange(range)
  }
}

function getElTextContent(el) {
  let textContent = ''
  const childNodes = el.childNodes
  childNodes.forEach(node => {
    textContent += node.textContent + '<br/>'
  })
  return textContent.trim().replace(/<br\/>$/, '')
}

export function createInputDiv(tpc) {
  console.time('createInputDiv')
  if (!tpc) return
  let div = $d.createElement('div')
  let origin = getElTextContent(tpc)
  tpc.appendChild(div)
  div.innerHTML = origin
  div.contentEditable = true
  div.spellcheck = false
  div.style.cssText = `min-width:${tpc.offsetWidth - 8}px;`
  if (this.direction === LEFT) div.style.right = 0
  div.focus()

  selectText(div)
  this.inputDiv = div

  this.bus.fire('operation', {
    name: 'beginEdit',
    obj: tpc.nodeObj,
  })

  div.addEventListener('keydown', e => {
    let key = e.keyCode
    if (key === 8) {
      // 不停止冒泡冒到document就把节点删了
      e.stopPropagation()
    } else if ((key === 13 || key === 9) && !e.shiftKey) {
      e.preventDefault()
      this.inputDiv.blur()
      this.map.focus()
    }
  })
  div.addEventListener('blur', () => {
    if (!div) return // 防止重复blur
    let node = tpc.nodeObj
    let topic = div.innerText
    if (topic === '') node.topic = origin
    else node.topic = topic
    div.remove()
    this.inputDiv = div = null
    this.bus.fire('operation', {
      name: 'finishEdit',
      obj: node,
      origin,
    })
    if (topic === origin) return // 没有修改不做处理
    tpc.innerHTML = ''
    // tpc.childNodes[0].textContent = node.topic
    createTopicText(tpc, node)
    this.linkDiv()
  })
  console.timeEnd('createInputDiv')
}

export let createExpander = function (expanded) {
  let expander = $d.createElement('epd')
  // 包含未定义 expanded 的情况，未定义视为展开
  expander.innerHTML = expanded !== false ? '-' : '+'
  expander.expanded = expanded !== false ? true : false
  expander.className = expanded !== false ? 'minus' : ''
  return expander
}

/**
 * traversal data and generate dom structure of mind map
 * @ignore
 * @param {object} data node data object
 * @param {object} first 'the box'
 * @param {number} direction primary node direction
 * @return {ChildrenElement} children element.
 */
export function createChildren(data, first, direction) {
  let chldr = $d.createElement('children')
  if (first) {
    chldr = first
  }
  for (let i = 0; i < data.length; i++) {
    let nodeObj = data[i]
    let grp = $d.createElement('GRP')
    if (first) {
      if (direction === LEFT) {
        grp.className = 'lhs'
      } else if (direction === RIGHT) {
        grp.className = 'rhs'
      } else if (direction === SIDE) {
        if (nodeObj.direction === LEFT) {
          grp.className = 'lhs'
        } else if (nodeObj.direction === RIGHT) {
          grp.className = 'rhs'
        }
      }
    }
    let top = createTop(nodeObj)
    if (nodeObj.children && nodeObj.children.length > 0) {
      top.appendChild(createExpander(nodeObj.expanded))
      grp.appendChild(top)
      if (nodeObj.expanded !== false) {
        let children = createChildren(nodeObj.children)
        grp.appendChild(children)
      }
    } else {
      grp.appendChild(top)
    }
    chldr.appendChild(grp)
  }
  return chldr
}

export function layout() {
  console.time('layout')
  this.root.innerHTML = ''
  this.box.innerHTML = ''
  let tpc = createTopic(this.nodeData)
  tpc.draggable = false
  this.root.appendChild(tpc)

  let primaryNodes = this.nodeData.children
  if (!primaryNodes || primaryNodes.length === 0) return
  if (this.direction === SIDE) {
    // init direction of primary node
    let lcount = 0
    let rcount = 0
    primaryNodes.map(node => {
      if (node.direction === undefined) {
        if (lcount <= rcount) {
          node.direction = LEFT
          lcount += 1
        } else {
          node.direction = RIGHT
          rcount += 1
        }
      } else {
        if (node.direction === LEFT) {
          lcount += 1
        } else {
          rcount += 1
        }
      }
    })
  }
  createChildren(this.nodeData.children, this.box, this.direction)
  console.timeEnd('layout')
}
