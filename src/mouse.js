import { dragMoveHelper } from './utils/index'
function getParents(elem, tag) {
  while (elem.parentNode) {
    if (
      (elem.nodeName.toLowerCase() === tag ||
        elem.nodeName.toLowerCase() === 'root') &&
      elem.className != 'map-canvas'
    ) {
      return elem
    }
    elem = elem.parentNode
  }
  return null
}
export default function (mind) {
  // mind.map.addEventListener('click', e => {
  //   // if (dragMoveHelper.afterMoving) return
  //   e.preventDefault()
  //   let t = getParents(e.target, 'ng')
  //   if (e.target.nodeName === 'EPD') {
  //     mind.expandNode(e.target.previousSibling)
  //   } else if (t) {
  //     mind.selectNode(t)
  //   } else if (e.target.nodeName === 'path') {
  //     if (e.target.parentElement.nodeName === 'g') {
  //       mind.selectLink(e.target.parentElement)
  //     }
  //   } else if (e.target.className === 'circle') {
  //     // skip circle
  //   } else {
  //     mind.unselectNode()
  //     mind.hideLinkController()
  //   }
  // })

  mind.map.addEventListener('dblclick', e => {
    e.preventDefault()
    if (!mind.editable) return
    let tpc = getParents(e.target, 'tpc')
    if (tpc) {
      mind.beginEdit(tpc)
    }
  })

  /**
   * drag and move
   */
  mind.map.addEventListener('mousemove', e => {
    // click trigger mousemove in windows chrome
    // the 'true' is a string
    if (e.target.contentEditable !== 'true') {
      dragMoveHelper.onMove(e, mind.container)
    }
  })
  mind.map.addEventListener('mousedown', e => {
    if (e.target.contentEditable !== 'true') {
      dragMoveHelper.afterMoving = false
      dragMoveHelper.mousedown = true
    }
  })
  mind.map.addEventListener('mouseleave', e => {
    dragMoveHelper.clear()
  })
  mind.map.addEventListener('mouseup', e => {
    dragMoveHelper.clear()
  })
}
