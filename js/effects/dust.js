// ==========================================
// Dust Particle Effect
// ==========================================

class Dust {

    constructor() {

        this.particles = [];

        this.create();

    }

    create() {

        this.particles = [];

        for(let i = 0; i < 120; i++) {

            this.particles.push({

                x: Math.random() * canvas.width,

                y: Math.random() * canvas.height,

                radius: Math.random() * 2 + 0.3,

                speed: Math.random() * 0.25 + 0.05,

                alpha: Math.random() * 0.25 + 0.05

            });

        }

    }

    update() {

        this.particles.forEach(p => {

            p.y -= p.speed;

            if(p.y < -10){

                p.y = canvas.height + 10;

                p.x = Math.random() * canvas.width;

            }

        });

    }

    draw() {

        this.particles.forEach(p => {

            ctx.beginPath();

            ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;

            ctx.arc(

                p.x,

                p.y,

                p.radius,

                0,

                Math.PI * 2

            );

            ctx.fill();

        });

    }

}

const dust = new Dust();