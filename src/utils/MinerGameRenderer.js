/**
 * 黄金矿工渲染层 - Canvas渲染器
 * 负责：钩子、矿物、抓取动画的渲染
 */
export class MinerGameRenderer {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.config = {
      canvasWidth: canvas.width,
      canvasHeight: canvas.height
    }

    // 颜色配置
    this.colors = {
      background: '#1a1a2e',
      hookRope: '#ffd700',
      hookRopeHighlight: '#ffec8b',
      hookTip: '#ffd700',
      hookTipInner: '#b8860b',
      hookBase: '#3498db',
      hookBaseInner: '#2980b9',
      word: '#e74c3c',
      auditBomb: '#9b59b6',
      moneyChest: '#f39c12',
      hcChest: '#2ecc71',
      diamond: '#3498db',
      extraHook: '#e94560'
    }
  }

  /**
   * 渲染一帧
   */
  render(state) {
    this.clear()
    this.drawItems(state.items)
    this.drawHook(state.hook)
  }

  /**
   * 清空画布
   */
  clear() {
    this.ctx.fillStyle = this.colors.background
    this.ctx.fillRect(0, 0, this.config.canvasWidth, this.config.canvasHeight)
  }

  /**
   * 绘制所有物品
   */
  drawItems(items) {
    items.forEach(item => this.drawItem(item))
  }

  /**
   * 绘制单个物品
   */
  drawItem(item) {
    switch (item.type) {
      case 'word':
        this._drawWord(item)
        break
      case 'audit_bomb':
        this._drawSpecialItem(item, this.colors.auditBomb, '💣')
        break
      case 'money_chest':
        this._drawSpecialItem(item, this.colors.moneyChest, '💰')
        break
      case 'hc_chest':
        this._drawSpecialItem(item, this.colors.hcChest, '📦')
        break
      case 'diamond':
        this._drawSpecialItem(item, this.colors.diamond, '💎', 12)
        break
      case 'extra_hook':
        this._drawSpecialItem(item, this.colors.extraHook, '🎣')
        break
    }
  }

  /**
   * 绘制坏词
   */
  _drawWord(item) {
    this.ctx.shadowColor = this.colors.word
    this.ctx.shadowBlur = 5

    this.ctx.fillStyle = this.colors.word
    this.ctx.beginPath()
    this.ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2)
    this.ctx.fill()

    this.ctx.shadowBlur = 0

    this.ctx.fillStyle = '#fff'
    this.ctx.font = 'bold 12px Arial'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillText(item.data.bad, item.x, item.y)
  }

  /**
   * 绘制特殊物品
   */
  _drawSpecialItem(item, color, emoji, shadowSize = 8) {
    this.ctx.shadowColor = color
    this.ctx.shadowBlur = shadowSize

    this.ctx.fillStyle = color
    this.ctx.beginPath()
    this.ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2)
    this.ctx.fill()

    this.ctx.shadowBlur = 0

    this.ctx.fillStyle = '#fff'
    this.ctx.font = 'bold 18px Arial'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillText(emoji, item.x, item.y)
  }

  /**
   * 绘制钩子
   */
  drawHook(hook) {
    // 确保钩子有有效的属性
    const safeHook = {
      x: hook.x || 250,
      y: hook.y || 50,
      angle: hook.angle !== undefined ? hook.angle : 0,
      length: hook.length || 0,
      caughtItem: hook.caughtItem
    }
    
    // 确保钩子有最小可见长度
    const displayLength = safeHook.length > 0 ? safeHook.length : 50
    const hookEnd = {
      x: safeHook.x + Math.sin(safeHook.angle) * displayLength,
      y: safeHook.y + Math.cos(safeHook.angle) * displayLength
    }

    // 绘制绳子
    this._drawRope(safeHook.x, safeHook.y, hookEnd.x, hookEnd.y)

    // 绘制钩子末端
    this._drawHookTip(hookEnd.x, hookEnd.y)

    // 绘制钩子根部
    this._drawHookBase(safeHook.x, safeHook.y)

    // 如果有抓住物品，同时绘制物品
    if (safeHook.caughtItem) {
      this._drawCaughtItem(safeHook.caughtItem, hookEnd.x, hookEnd.y)
    }
  }

  /**
   * 绘制绳子
   */
  _drawRope(startX, startY, endX, endY) {
    // 绳子发光效果
    this.ctx.shadowColor = this.colors.hookRope
    this.ctx.shadowBlur = 8
    
    // 主绳（更粗）
    this.ctx.strokeStyle = this.colors.hookRope
    this.ctx.lineWidth = 8
    this.ctx.lineCap = 'round'
    this.ctx.beginPath()
    this.ctx.moveTo(startX, startY)
    this.ctx.lineTo(endX, endY)
    this.ctx.stroke()

    // 高亮
    this.ctx.shadowBlur = 0
    this.ctx.strokeStyle = this.colors.hookRopeHighlight
    this.ctx.lineWidth = 4
    this.ctx.beginPath()
    this.ctx.moveTo(startX, startY)
    this.ctx.lineTo(endX, endY)
    this.ctx.stroke()
  }

  /**
   * 绘制钩子末端
   */
  _drawHookTip(x, y) {
    // 发光外圆
    this.ctx.shadowColor = this.colors.hookTip
    this.ctx.shadowBlur = 15
    this.ctx.fillStyle = this.colors.hookTip
    this.ctx.beginPath()
    this.ctx.arc(x, y, 14, 0, Math.PI * 2)
    this.ctx.fill()
    this.ctx.shadowBlur = 0

    // 内圆
    this.ctx.fillStyle = this.colors.hookTipInner
    this.ctx.beginPath()
    this.ctx.arc(x, y, 10, 0, Math.PI * 2)
    this.ctx.fill()
    
    // 添加钩子图标文字，让玩家清楚看到钩子位置
    this.ctx.fillStyle = '#fff'
    this.ctx.font = 'bold 16px Arial'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillText('🎣', x, y)
  }

  /**
   * 绘制钩子根部
   */
  _drawHookBase(x, y) {
    this.ctx.fillStyle = this.colors.hookBase
    this.ctx.beginPath()
    this.ctx.arc(x, y, 25, 0, Math.PI * 2)
    this.ctx.fill()

    this.ctx.fillStyle = this.colors.hookBaseInner
    this.ctx.beginPath()
    this.ctx.arc(x, y, 18, 0, Math.PI * 2)
    this.ctx.fill()

    this.ctx.fillStyle = '#fff'
    this.ctx.beginPath()
    this.ctx.arc(x, y, 8, 0, Math.PI * 2)
    this.ctx.fill()
  }

  /**
   * 绘制被抓住的物品
   */
  _drawCaughtItem(item, x, y) {
    // 物品在钩子下方
    this.drawItem({
      ...item,
      x: x,
      y: y + item.radius + 10
    })
  }
}
