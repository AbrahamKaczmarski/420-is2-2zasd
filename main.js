import * as THREE from 'three'
import App from './scripts/App'
import buildTree from './scripts/Tree'

const NODE_NAMES = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z'
]

const NODE_TYPES = ['BRANCH', 'LEAVES']

const global = {
  app: null,
  clear: true,
  grammar: null,
  rules: null,
  scene: null,
  symbols: {},
  nodes: null
}

const grassTexture = new THREE.TextureLoader().load('img/grass-round.png')

window.onload = init

function init() {
  const c = document.querySelector('canvas')
  global.app = new App(c, { grid: false, ambient: true, setup })
  initUi()
}

function setup({ scene }) {
  global.scene = scene
  clearScene()
}

function initUi() {
  document.getElementById('btn-options').addEventListener('click', () => {
    document.querySelector('.config').classList.toggle('config-visible')
  })

  document.getElementById('btn-start').addEventListener('click', () => {
    global.grammar = document.querySelector('.grammar-input').value
    updateRules()
    clearScene()
    addTree()
    global.clear = false
  })

  document.getElementById('btn-step').addEventListener('click', () => {
    if (global.clear) {
      global.grammar = document.querySelector('.grammar-input').value
      updateRules()
      clearScene()
      addTree()
      global.clear = false
    } else {
      updateGrammar()
      clearScene()
      addTree()
    }
  })

  document.getElementById('btn-clear').addEventListener('click', () => {
    global.clear = true
    clearScene()
  })

  document.getElementById('nav-info').addEventListener('click', e => {
    document.querySelector('.tab-visible').classList.remove('tab-visible')
    document.querySelector('.tab-info').classList.add('tab-visible')
    document.querySelector('.nav-active').classList.remove('nav-active')
    e.target.classList.add('nav-active')
  })

  document.getElementById('nav-nodes').addEventListener('click', e => {
    document.querySelector('.tab-visible').classList.remove('tab-visible')
    document.querySelector('.tab-nodes').classList.add('tab-visible')
    document.querySelector('.nav-active').classList.remove('nav-active')
    e.target.classList.add('nav-active')
  })

  document.getElementById('nav-rules').addEventListener('click', e => {
    document.querySelector('.tab-visible').classList.remove('tab-visible')
    document.querySelector('.tab-rules').classList.add('tab-visible')
    document.querySelector('.nav-active').classList.remove('nav-active')
    e.target.classList.add('nav-active')
  })

  document.getElementById('nav-props').addEventListener('click', e => {
    document.querySelector('.tab-visible').classList.remove('tab-visible')
    document.querySelector('.tab-props').classList.add('tab-visible')
    document.querySelector('.nav-active').classList.remove('nav-active')
    e.target.classList.add('nav-active')
  })

  document.getElementById('function').addEventListener('change', e => {
    console.log(e.target.value)
  })

  document.getElementById('light').addEventListener('change', e => {
    global.app.changeAmbientLight(parseInt(e.target.value))
  })

  document
    .getElementById('btn-add-row')
    .addEventListener('click', () => addCustomNode())

  addCustomNode({
    name: 'A',
    type: 'BRANCH',
    color: '#332211',
    direction: 0,
    bend: 0
  })
  addCustomNode({
    name: 'B',
    type: 'BRANCH',
    color: '#332211',
    direction: 30,
    bend: 20
  })
  addCustomNode({
    name: 'C',
    type: 'BRANCH',
    color: '#332211',
    direction: 135,
    bend: 10
  })
  addCustomNode({
    name: 'X',
    type: 'LEAVES',
    color: '#2a5c0f',
    direction: 0,
    bend: 0
  })

  document
    .getElementById('btn-add-rule')
    .addEventListener('click', () => addRule())

  addRule('X', '[BX][CX]')
  addRule('B', 'BA')
  addRule('C', 'CA')
}

function addCustomNode({
  name,
  type = 'BRANCH',
  color = '#6c6774',
  direction = rand(0, 12) * 30,
  bend = rand(0, 9) * 10
} = {}) {
  if (!name) {
    name = NODE_NAMES.filter(name => !global.symbols[name])[0]
  }

  const row = document.querySelector('#custom-node-row').content.cloneNode(true)

  const nameList = row.querySelector('.node-name')
  const typeList = row.querySelector('.node-type')
  const colorSelect = row.querySelector('.node-color')
  const bendInput = row.querySelector('.node-x')
  const directionInput = row.querySelector('.node-y')

  NODE_NAMES.forEach(key => {
    const o = document.createElement('option')
    o.value = key
    o.innerHTML = key
    o.classList.add(key)
    nameList.appendChild(o)
  })

  NODE_TYPES.forEach(key => {
    const o = document.createElement('option')
    o.value = key
    o.innerHTML = key
    typeList.appendChild(o)
  })

  nameList.value = name
  typeList.value = type
  colorSelect.value = color
  bendInput.value = bend
  directionInput.value = direction

  nameList.addEventListener('focus', e => {
    nameList.setAttribute('data-prevValue', e.target.value)
  })

  nameList.addEventListener('change', e => {
    const prev = e.target.getAttribute('data-prevValue')
    const v = e.target.value
    global.symbols[v] = global.symbols[prev]
    delete global.symbols[prev]
    nameList.setAttribute('data-prevValue', v)
    nameList.parentElement.setAttribute('data-key', v)
    updateNameLists()
  })

  typeList.addEventListener('change', e => {
    const key = e.target.parentElement.getAttribute('data-key')
    global.symbols[key].type = e.target.value
  })

  colorSelect.addEventListener('change', e => {
    const key = e.target.parentElement.getAttribute('data-key')
    global.symbols[key].material = materialFromColor(e.target.value)
  })

  bendInput.addEventListener('change', e => {
    const key = e.target.parentElement.getAttribute('data-key')
    global.symbols[key].bend = parseInt(e.target.value)
  })

  directionInput.addEventListener('change', e => {
    const key = e.target.parentElement.getAttribute('data-key')
    global.symbols[key].direction = parseInt(e.target.value)
  })

  addSymbol(name, direction, bend, type, color)
  nameList.parentElement.setAttribute('data-key', name)

  row.querySelector('button').addEventListener('click', ({ target }) => {
    if (target.parentElement.parentElement.children.length < 3) return
    target.parentElement.remove()
  })

  document.querySelector('.config-nodes-custom').appendChild(row)
  updateNameLists()
}

const updateNameLists = () => {
  // -- reset disabled
  document.querySelectorAll('option[disabled]').forEach(option => {
    option.disabled = false
  })
  // -- disable taken values

  const lists = document.querySelectorAll('.node-name')
  // console.log(global.symbols);
  Object.keys(global.symbols).forEach(key => {
    lists.forEach(list => {
      if (list.value !== key) {
        list.querySelector(`.${key}`).disabled = true
      }
    })
  })
}

function addRule(symbol = '', substitute = '') {
  const rule = document.querySelector('#rule-template').content.cloneNode(true)

  rule.querySelector('.rule-symbol').value = symbol
  rule.querySelector('.rule-substitute').value = substitute

  rule.querySelector('button').addEventListener('click', ({ target }) => {
    if (target.parentElement.parentElement.children.length < 2) return
    target.parentElement.remove()
  })

  document.querySelector('.config-rules').appendChild(rule)
}

function addSymbol(name, direction, bend, type, color) {
  global.symbols[name] = {
    direction,
    bend,
    type,
    material: materialFromColor(color)
  }
}

function updateRules() {
  global.rules = {}
  document.querySelectorAll('.rule').forEach(node => {
    const rule = node.querySelector('.rule-symbol').value
    const substitute = node.querySelector('.rule-substitute').value
    global.rules[rule] = substitute
  })
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function addTree() {
  const f = document.getElementById('function').value
  const s = document.getElementById('size').value
  const p = document.getElementById('proportions').value
  const leaves = document.getElementById('foliage').value
  buildTree(
    global.scene,
    global.grammar,
    global.symbols,
    f,
    s,
    s * p,
    s * leaves
  )
}

function clearScene() {
  global.scene.clear()

  const light = global?.app?.light / 100 || 1

  const ambient = new THREE.AmbientLight()
  ambient.color.setHSL(0, 0, light)
  ambient.name = 'ambient'
  global.scene.add(ambient)

  const sun = new THREE.PointLight()
  sun.color.setHSL(0, 0, light)
  sun.name = 'sun'
  sun.position.set(50, 100, 50)
  global.scene.add(sun)

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(150, 150),
    new THREE.MeshStandardMaterial({ map: grassTexture, transparent: true })
  )
  ground.rotateX(-Math.PI / 2)
  global.scene.add(ground)
}

function updateGrammar() {
  global.grammar = global.grammar
    .split('')
    .map(symbol => (global.rules[symbol] ? global.rules[symbol] : symbol))
    .join('')
}

function materialFromColor(color) {
  return new THREE.MeshStandardMaterial({ color })
}
