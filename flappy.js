function newElement(tagName, className) {
    const element = document.createElement(tagName)
    element.className = className
    return element
}

function Barreira(reversa = false) {
    this.elemento = newElement('div', 'barreira')

    const borda = newElement('div', 'borda')
    const corpo = newElement('div', 'corpo')

    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`
}

function pardebarreiras(altura, abertura, x) {
    this.elemento = newElement('div', 'par-de-barreiras')

    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(x)
}

function Barreiras(altura, largura, abertura, espaco, notificaponto) {
    this.pares = [
        new pardebarreiras(altura, abertura, largura),
        new pardebarreiras(altura, abertura, largura + espaco),
        new pardebarreiras(altura, abertura, largura + espaco * 2),
        new pardebarreiras(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 3
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            //quando elemento sair da tela
            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura / 2
            const cruzouOMeio = par.getX() + deslocamento >= meio && par.getX() < meio
            if (cruzouOMeio) {
                notificaponto()
            }
        })
    }
}

function Passaro(alturaJogo) {
    let voando = false

    this.elemento = new newElement('img', 'passaro')
    this.elemento.src = './imgs/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight

        if (novoY <= 0) {
            this.setY(0)
        } else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        }
        else {
            this.setY(novoY)
        }
    }

    this.setY(alturaJogo / 2)
}

function Progresso() {
    this.elemento = newElement('span', 'progresso')
    this.atualizarPontos = (pontos) => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

function estaoSobrePostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left 
        && b.left + b.width >= a.left

    const vertical = a.top + a.height >= b.top 
        && b.top + b.height >= a.top

    return horizontal && vertical
}

function Colidiu(passaro, barreias) {
    let colidiu = false

    barreias.pares.forEach(pardebarreiras =>  {
        if(!colidiu) {
            const superior = pardebarreiras.superior.elemento
            const inferior = pardebarreiras.inferior.elemento

            colidiu = estaoSobrePostos(passaro.elemento, superior) || (estaoSobrePostos(passaro.elemento, inferior))
        }
    })
    return colidiu
}

function FlappyBird() {
    let pontos = 0

    const areaDoJogo = document.querySelector('[wb-flappy]')
    const alturaJogo = areaDoJogo.clientHeight
    const larguraJogo = areaDoJogo.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(alturaJogo, larguraJogo, 250, 400, () => {
        progresso.atualizarPontos(++pontos)
    })
    const passaro = new Passaro(alturaJogo)

    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        //loop temporizador

        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if(Colidiu(passaro, barreiras)) {
                clearInterval(temporizador)
            }
        }, 20)
    }
}

new FlappyBird().start()