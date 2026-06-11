/**
 * 黄金矿工逻辑层 - 独立的原生JS模块
 * 负责：物理运动、碰撞检测、计时器、状态机
 */
export class MinerGameEngine {
  constructor(options = {}) {
    this.config = {
      canvasWidth: options.canvasWidth || 500,
      canvasHeight: options.canvasHeight || 400,
      baseTime: options.baseTime || 10,
      baseHookSpeed: options.baseHookSpeed || 0.03,
      baseMaxLength: options.baseMaxLength || 250,
      upgradeSpeedBonus: options.upgradeSpeedBonus || 0.008,
      upgradeLengthBonus: options.upgradeLengthBonus || 30,
      upgradeMagnetBonus: options.upgradeMagnetBonus || 20,
      ...options
    }

    // 游戏状态
    this.state = {
      phase: 'idle', // idle, swinging, launching, returning
      timeLeft: this.config.baseTime,
      isPlaying: false
    }

    // 钩子状态
    this.hook = {
      x: this.config.canvasWidth / 2,
      y: 50,
      angle: 0,
      angleDirection: 1,
      length: 0,
      speed: this.config.baseHookSpeed,
      maxLength: this.config.baseMaxLength,
      caughtItem: null
    }

    // 物品列表
    this.items = []

    // 事件回调
    this.callbacks = {
      onStateChange: null,
      onItemCaught: null,
      onTimeUp: null
    }

    // 升级等级
    this.upgradeLevels = {
      length: 0,
      speed: 0,
      magnetism: 0
    }

    // 游戏循环
    this.animationId = null
    this.lastTime = 0
  }

  /**
   * 设置升级等级
   */
  setUpgrades(levels) {
    this.upgradeLevels = { ...this.upgradeLevels, ...levels }
    this.hook.speed = this.config.baseHookSpeed + this.upgradeLevels.speed * this.config.upgradeSpeedBonus
    this.hook.maxLength = this.config.baseMaxLength + this.upgradeLevels.length * this.config.upgradeLengthBonus
  }

  /**
   * 生成游戏物品
   */
  generateItems(badWords) {
    this.items = []
    const usedPositions = new Set()

    // 添加坏词
    badWords.forEach((word, index) => {
      if (!word.caught) {
        let posX, posY, attempts = 0
        do {
          posX = 80 + Math.random() * 340
          posY = 140 + Math.random() * 200
          attempts++
        } while (usedPositions.has(`${Math.floor(posX / 60)},${Math.floor(posY / 60)}`) && attempts < 12)

        usedPositions.add(`${Math.floor(posX / 60)},${Math.floor(posY / 60)}`)
        this.items.push({
          type: 'word',
          data: word,
          x: posX,
          y: posY,
          radius: 32,
          weight: word.weight || 'medium'
        })
      }
    })

    // 随机添加特殊物品
    this._addRandomItem('audit_bomb', '💣', '审计炸弹', 0.3, 28, 200, 150, 200, 120, usedPositions)
    this._addRandomItem('money_chest', '💰', '资金宝箱', 0.4, 30, 80, 120, 220, 100, usedPositions)
    this._addRandomItem('hc_chest', '📦', 'HC宝箱', 0.2, 30, 320, 100, 180, 120, usedPositions)
    this._addRandomItem('diamond', '💎', '钻石', 0.15, 22, 200, 100, 280, 60, usedPositions)
    this._addRandomItem('extra_hook', '🎣', '额外钩子', 0.25, 24, 100, 150, 250, 80, usedPositions)
  }

  /**
   * 添加随机物品
   */
  _addRandomItem(type, icon, name, chance, radius, xMin, xRange, yMin, yRange, usedPositions) {
    if (Math.random() > chance) {
      let x, y, attempts = 0
      do {
        x = xMin + Math.random() * xRange
        y = yMin + Math.random() * yRange
        attempts++
      } while (usedPositions.has(`${Math.floor(x / 60)},${Math.floor(y / 60)}`) && attempts < 8)

      usedPositions.add(`${Math.floor(x / 60)},${Math.floor(y / 60)}`)
      this.items.push({ type, name, x, y, radius, icon })
    }
  }

  /**
   * 开始游戏
   */
  startGame(baseTime = this.config.baseTime) {
    this.state.timeLeft = baseTime
    this.state.isPlaying = true
    this.state.phase = 'swinging'
    this.resetHook()
    this.lastTime = performance.now()
    this.loop()
    this.notifyStateChange()
  }

  /**
   * 重置钩子
   */
  resetHook() {
    this.hook.x = this.config.canvasWidth / 2
    this.hook.y = 50
    this.hook.angle = 0
    this.hook.angleDirection = 1
    this.hook.length = 0
    this.hook.caughtItem = null
    this.hook.speed = this.config.baseHookSpeed + this.upgradeLevels.speed * this.config.upgradeSpeedBonus
    this.hook.maxLength = this.config.baseMaxLength + this.upgradeLevels.length * this.config.upgradeLengthBonus
  }

  /**
   * 发射钩子
   */
  launch() {
    if (this.state.phase === 'swinging') {
      this.state.phase = 'launching'
      this.notifyStateChange()
    }
  }

  /**
   * 游戏主循环
   */
  loop() {
    if (!this.state.isPlaying) return

    const now = performance.now()
    const delta = (now - this.lastTime) / 1000
    this.lastTime = now

    this.update(delta)

    this.animationId = requestAnimationFrame(() => this.loop())
  }

  /**
   * 更新游戏状态
   */
  update(delta) {
    // 更新计时器（只在摆动时）
    if (this.state.phase === 'swinging') {
      this.state.timeLeft -= delta
      if (this.state.timeLeft <= 0) {
        this.state.timeLeft = 0
        if (this.callbacks.onTimeUp) {
          this.callbacks.onTimeUp()
        }
        return
      }
      this.notifyStateChange()
    }

    switch (this.state.phase) {
      case 'swinging':
        this.updateSwinging()
        break
      case 'launching':
        this.updateLaunching()
        break
      case 'returning':
        this.updateReturning(delta)
        break
    }
  }

  /**
   * 更新摆动
   */
  updateSwinging() {
    this.hook.angle += this.hook.speed * this.hook.angleDirection
    // 增大摆动幅度，从±0.8增加到±1.8，覆盖更多区域
    if (this.hook.angle > 1.8 || this.hook.angle < -1.8) {
      this.hook.angleDirection *= -1
    }
  }

  /**
   * 更新发射
   */
  updateLaunching() {
    this.hook.length += 3

    // 碰撞检测
    const hookEnd = this.getHookEndPos()
    const catchRadius = 10 + this.upgradeLevels.magnetism * this.config.upgradeMagnetBonus

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i]
      const dx = hookEnd.x - item.x
      const dy = hookEnd.y - item.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < item.radius + catchRadius) {
        this.hook.caughtItem = item
        this.items.splice(i, 1)
        this.state.phase = 'returning'
        this.notifyStateChange()
        return
      }
    }

    // 到达最大长度
    if (this.hook.length >= this.hook.maxLength) {
      this.state.phase = 'returning'
      this.notifyStateChange()
    }
  }

  /**
   * 更新回收
   */
  updateReturning(delta) {
    let pullSpeed = 4

    // 根据重量调整速度
    if (this.hook.caughtItem && this.hook.caughtItem.type === 'word') {
      switch (this.hook.caughtItem.data.weight) {
        case 'light':
          pullSpeed = 6
          break
        case 'medium':
          pullSpeed = 4
          break
        case 'heavy':
          pullSpeed = 2
          break
      }
    }

    // 升级加成
    pullSpeed += this.upgradeLevels.speed * 1

    this.hook.length -= pullSpeed

    if (this.hook.length <= 0) {
      this.hook.length = 0

      if (this.hook.caughtItem) {
        if (this.callbacks.onItemCaught) {
          this.callbacks.onItemCaught(this.hook.caughtItem)
        }
        this.hook.caughtItem = null
      }

      this.state.phase = 'swinging'
      this.notifyStateChange()
    }
  }

  /**
   * 获取钩子末端位置
   */
  getHookEndPos() {
    return {
      x: this.hook.x + Math.sin(this.hook.angle) * this.hook.length,
      y: this.hook.y + Math.cos(this.hook.angle) * this.hook.length
    }
  }

  /**
   * 停止游戏
   */
  stopGame() {
    this.state.isPlaying = false
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  /**
   * 设置回调
   */
  setCallback(name, fn) {
    if (this.callbacks.hasOwnProperty(name)) {
      this.callbacks[name] = fn
    }
  }

  /**
   * 通知状态变化
   */
  notifyStateChange() {
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(this.getState())
    }
  }

  /**
   * 获取当前游戏状态（用于UI层）
   */
  getState() {
    return {
      phase: this.state.phase,
      timeLeft: this.state.timeLeft,
      isPlaying: this.state.isPlaying,
      hook: { ...this.hook },
      items: [...this.items],
      hookEnd: this.getHookEndPos()
    }
  }

  /**
   * 获取钩子状态（用于渲染）
   */
  getHookState() {
    return { ...this.hook }
  }

  /**
   * 获取物品列表（用于渲染）
   */
  getItems() {
    return [...this.items]
  }
}
