function tickFox() {
    // passive behaviours while idle
    if (fox.phase === 'idle' && fox.poseBlend < 0.01) {
        // yawn
        if (fox.yawnT < 0 && Math.random() < 0.0008) fox.yawnT = 0;
        if (fox.yawnT >= 0) {
            fox.yawnT++;
            if (fox.yawnT >= 80) fox.yawnT = -1;
        }
        // ear twitch
        if (fox.earTwitchT < 0 && Math.random() < 0.002) {
            fox.earTwitchT = 0;
            fox.earTwitchSide = Math.random() < 0.5 ? 1 : -1;
        }
        if (fox.earTwitchT >= 0) {
            fox.earTwitchT++;
            if (fox.earTwitchT >= 20) fox.earTwitchT = -1;
        }
        // ear twitch on lightning
        if (weather === 'storm' && lightning.active && lightning.t === 1) {
            fox.earTwitchT = 0; // enable twitch
            fox.earTwitchSide = 1;
        }
    }
    // grumble countdown (if active)
    if (fox.grumbleT >= 0) {
        fox.grumbleT++;
        if (fox.grumbleT >= 40) fox.grumbleT = -1;
    }

    // phase behaviours
    if (fox.phase === 'idle') return;
    fox.phaseT++;
    const cfg = FP[fox.phase];
    const p = clamp(fox.phaseT / cfg.f, 0, 1);

    if (fox.phase === 'standup') {
        fox.poseBlend = eio(p);
        fox.stretchBlend = 0;
        if (fox.phaseT >= cfg.f) {
            fox.phase = 'stretch';
            fox.phaseT = 0;
        }

    } else if (fox.phase === 'stretch') {
        fox.poseBlend = 1;
        fox.stretchBlend = Math.sin(p * Math.PI);
        if (fox.phaseT >= cfg.f) {
            fox.phase = 'shake';
            fox.phaseT = 0;
            fox.stretchBlend = 0;
        }

    } else if (fox.phase === 'shake') {
        fox.poseBlend = 1;
        fox.tailWag = Math.sin(fox.phaseT * 0.25) * 0.55;
        if (fox.phaseT >= cfg.f) {
            fox.phase = 'spin';
            fox.phaseT = 0;
            fox.tailWag = 0;
        }

    } else if (fox.phase === 'spin') {
        fox.poseBlend = 1;
        fox.spinAngle = eio(p) * Math.PI * 2;
        if (fox.phaseT >= cfg.f) {
            fox.phase = 'curling';
            fox.phaseT = 0;
            fox.spinAngle = 0;
        }

    } else if (fox.phase === 'curling') {
        fox.poseBlend = 1 - eio(p);
        if (fox.phaseT >= cfg.f) {
            fox.phase = 'idle';
            fox.poseBlend = 0;
            statusEl.textContent = 'Curled up, fast asleep…';
            enableButtons();
        }

    } else if (fox.phase === 'bunny_standup') {
        fox.poseBlend = eio(p);
        fox.stretchBlend = 0;
        if (fox.phaseT >= cfg.f) fox.phase = 'idle';

    } else if (fox.phase === 'bunny_curling') {
        fox.poseBlend = 1 - eio(p);
        if (fox.phaseT >= cfg.f) {
            fox.phase = 'idle';
            fox.poseBlend = 0;
        }

    } else if (fox.phase === 'wander_out') {
        fox.poseBlend = 1;
        fox.wanderX = lerp(fox.x, fox.x + 180, eo(p));
        if (fox.phaseT >= cfg.f) {
            fox.phase = 'wander_sniff';
            fox.phaseT = 0;
        }

    } else if (fox.phase === 'wander_sniff') {
        fox.wanderX = fox.x + 180 + Math.sin(fox.phaseT * 0.05) * 15;
        if (fox.phaseT >= cfg.f) {
            fox.phase = 'wander_in';
            fox.phaseT = 0;
        }

    } else if (fox.phase === 'wander_in') {
        fox.wanderX = lerp(fox.x + 180, fox.x, eo(p));
        if (fox.phaseT >= cfg.f) {
            fox.phase = 'curling';
            fox.phaseT = 0;
            fox.wanderX = fox.x;
            statusEl.textContent = 'Back home, curling up…';
        }
    }
}

function tickBunny() {
    if (bunny.phase === 'off' || bunny.phase === 'done') return;
    bunny.phaseT++;

    if (bunny.phase === 'hopping_in') {
        if (tickHop()) {
            bunny.hop.arc = 0;
            bunny.phase = 'fox_waking';
            bunny.phaseT = 0;
            fox.phase = 'bunny_standup';
            fox.phaseT = 0;
            fox.poseBlend = 0;
            statusEl.textContent = 'The fox stirs…';
        }
    } else if (bunny.phase === 'fox_waking') {
        if (bunny.phaseT >= 90) {
            bunny.phase = 'nuzzle';
            bunny.phaseT = 0;
            hearts = [];
            statusEl.textContent = 'They touch noses… ♥';
        }

    } else if (bunny.phase === 'nuzzle') {
        bunny.hop.arc = 0;
        if (bunny.phaseT % 20 === 0 && bunny.phaseT < 140) {
            const noseX = (bunny.x + 35 + fox.x - 34) / 2;
            hearts.push({x: noseX + rndPM(10), y: bunny.y - 72, vy: -0.55 - rnd(0.45), life: 0});
        }
        hearts.forEach(h => {
            h.y += h.vy;
            h.life++;
        });
        hearts = hearts.filter(h => h.life < 65);
        if (bunny.phaseT >= 160) {
            bunny.phase = 'fox_sleep';
            bunny.phaseT = 0;
            fox.phase = 'bunny_curling';
            fox.phaseT = 0;
            hearts = [];
            statusEl.textContent = 'The fox drifts off…';
        }
    } else if (bunny.phase === 'fox_sleep') {
        if (bunny.phaseT >= 95) {
            bunny.phase = 'hopping_out';
            bunny.phaseT = 0;
            startHop(bunny.x, W + 90, 130);
            statusEl.textContent = 'The bunny hops off…';
        }
    } else if (bunny.phase === 'hopping_out') {
        if (tickHop()) {
            bunny.phase = 'done';
            statusEl.textContent = 'Curled up, fast asleep…';
            enableButtons();
        }
    }
}
