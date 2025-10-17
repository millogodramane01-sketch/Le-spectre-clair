// Ce code est la logique complète pour Le Spectre Éclair
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const playArea = document.getElementById('play-area');
    const startButton = document.getElementById('startButton');
    const scoreValue = document.getElementById('score-value');
    const livesValue = document.getElementById('lives-value'); // Nous allons réutiliser ceci pour le temps
    const message = document.getElementById('message');

    // CONFIGURATION DU JEU
    const GAME_DURATION_SECONDS = 45; // Durée de la partie en secondes
    const COLORS = [
        '#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22'
    ];
    
    let score = 0;
    let totalClicks = 0;    // Nombre total de clics effectués
    let correctClicks = 0;  // Nombre de clics corrects (pour la concentration)
    let gameTimer;          // Intervalle pour le décompte du temps
    let gameLoopInterval;   // Intervalle pour le changement de couleur
    let timeLeft = GAME_DURATION_SECONDS;
    let gameSpeed = 1600;

    // Mise à jour de l'affichage initial pour le temps
    document.querySelector('#game-status span:last-child').innerHTML = `Temps: <span id="time-value">${GAME_DURATION_SECONDS}s</span>`;
    const timeValue = document.getElementById('time-value');

    // --- Fonctions utilitaires et de Feedback ---

    function getRandomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    // Fonction pour donner un commentaire en fonction du pourcentage de réussite
    function getFeedback(successRate) {
        if (successRate === 100) {
            return { title: "Vision du Spectre Absolue !", comment: "Félicitations Dramane ! Votre concentration est parfaite. Vous êtes un maître du Spectre Éclair !" };
        } else if (successRate >= 90) {
            return { title: "Réflexes Éclairs !", comment: "Une concentration incroyable et des réflexes vifs. Vous ne laissez rien passer." };
        } else if (successRate >= 75) {
            return { title: "Bon Équilibre Spectral", comment: "Solide performance ! Un petit effort pour ignorer les distractions, et vous atteindrez l'excellence." };
        } else if (successRate >= 50) {
            return { title: "Potentiel à Développer", comment: "Une bonne base, mais votre concentration a vacillé quelques fois. Entraînez votre œil !" };
        } else {
            return { title: "Vision Obstruée", comment: "La vitesse vous a submergé. Entraînez-vous lentement pour améliorer votre discrimination des couleurs." };
        }
    }

    // --- Logique du Jeu Principal ---
    
    function mainGameLogic() {
        // 1. Accélération
        if (score > 0 && score % 8 === 0 && gameSpeed > 400) {
            gameSpeed = Math.max(400, gameSpeed - 100);
            clearInterval(gameLoopInterval);
            gameLoopInterval = setInterval(mainGameLogic, gameSpeed);
        }

        // 2. Préparation
        playArea.innerHTML = ''; 
        
        const currentBgColor = getRandomElement(COLORS);
        body.style.backgroundColor = currentBgColor;

        const intrusiveColor = getRandomElement(COLORS.filter(c => c !== currentBgColor));

        // Augmente la difficulté du nombre de blocs (max 12)
        const numBlocks = Math.min(6 + Math.floor(score / 15), 12); 
        const intrusiveIndex = Math.floor(Math.random() * numBlocks);
        
        // 3. Création des blocs
        for (let i = 0; i < numBlocks; i++) {
            const block = document.createElement('div');
            block.classList.add('color-block');
            
            if (i === intrusiveIndex) {
                block.style.backgroundColor = intrusiveColor;
                block.dataset.isTarget = 'true';
            } else {
                block.style.backgroundColor = currentBgColor;
                block.dataset.isTarget = 'false';
            }
            
            block.addEventListener('click', handleBlockClick);
            playArea.appendChild(block);
        }
    }
    
    // --- Gestion des Actions ---

    function handleBlockClick(e) {
        if (!gameLoopInterval) return; // Ignore les clics si le jeu n'est pas démarré
        
        totalClicks++;

        if (e.target.dataset.isTarget === 'true') {
            // BON CLIC
            score++;
            correctClicks++;
            scoreValue.textContent = score;
            
            // Passe immédiatement à la manche suivante
            mainGameLogic(); 
        } else {
            // MAUVAIS CLIC
            
            // Effet visuel d'erreur rapide
            body.style.backgroundColor = '#c0392b'; 
            setTimeout(() => { body.style.backgroundColor = document.querySelector('.color-block:not([data-is-target="true"])').style.backgroundColor; }, 100);
        }
    }

    // --- Gestion du Temps ---

    function startTimer() {
        gameTimer = setInterval(() => {
            timeLeft--;
            timeValue.textContent = `${timeLeft}s`;

            if (timeLeft <= 10) {
                timeValue.style.color = '#e74c3c'; // Avertissement rouge
            }

            if (timeLeft <= 0) {
                gameOver();
            }
        }, 1000);
    }
    
    // --- États du Jeu ---
    
    function startGame() {
        // Arrête les anciens intervalles
        if (gameLoopInterval) clearInterval(gameLoopInterval);
        if (gameTimer) clearInterval(gameTimer);

        // Réinitialisation des variables
        score = 0;
        totalClicks = 0;
        correctClicks = 0;
        gameSpeed = 1600;
        timeLeft = GAME_DURATION_SECONDS;

        // Mise à jour de l'affichage
        scoreValue.textContent = score;
        timeValue.textContent = `${timeLeft}s`;
        timeValue.style.color = '#ecf0f1';
        
        message.style.display = 'none';
        startButton.textContent = "Recommencer";

        // Démarrage
        startTimer();
        gameLoopInterval = setInterval(mainGameLogic, gameSpeed);
        mainGameLogic(); // Affiche la première manche
    }

    function gameOver() {
        clearInterval(gameLoopInterval);
        clearInterval(gameTimer);
        
        // 1. Calcul des statistiques
        const successRate = totalClicks > 0 ? Math.round((correctClicks / totalClicks) * 100) : 0;
        const feedback = getFeedback(successRate);

        // 2. Affichage des résultats détaillés
        playArea.innerHTML = `
            <div id="result-message">
                <h2 style="color:#f1c40f;">${feedback.title}</h2>
                <p style="font-size: 1.5em; margin: 15px 0;">Score final : <strong style="color: #2ecc71;">${score}</strong></p>
                <p><strong>Concentration :</strong> ${successRate}% de clics corrects (${correctClicks}/${totalClicks})</p>
                <p style="margin-top: 15px; padding: 10px; border: 1px dashed #bdc3c7; border-radius: 8px;">
                    ${feedback.comment}
                </p>
            </div>
        `;
        startButton.textContent = "Rejouer (45s)";
        body.style.backgroundColor = '#333';
        message.style.display = 'block';
    }
    
    // --- Événement de Démarrage ---
    startButton.addEventListener('click', startGame);

    // Initialisation
    document.getElementById('message').style.display = 'block';
});
