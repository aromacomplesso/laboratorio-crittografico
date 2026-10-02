# Relazione Tecnica e Metodologica per Francesca
## Decifrazione della Grande Pergamena di Bérenger Saunière (Rennes-le-Château)

Questa relazione illustra il funzionamento matematico e crittografico del **Laboratorio Web** sviluppato per accompagnare il volume divulgativo sul Mistero di Rennes-le-Château, recependo tutte le indicazioni e i test case forniti da **Francesca**.

---

## 1. Il Cifrario di Vigenère del Priorato di Sion

### A. L'Alfabeto a 25 Lettere (Reperto Fotografico 1)
La tabella crittografica tramandata dal Priorato di Sion esclude rigorosamente la lettera **`W`**, conformemente all'alfabeto francese ottocentesco adottato negli scritti di Philippe de Chérisey e Pierre Plantard.

L'alfabeto a 25 caratteri è il seguente:
$$\text{Alfabeto: } [Z, A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, X, Y]$$

Assegnando a ciascuna lettera l'indice corrispondente alla sua posizione nella Tabula Recta fotografata (con $Z = 0$):

| Lettera | Z | A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | X | Y |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Indice** | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 |

### B. Verifica del Test Case Fornito da Francesca
- **Testo sorgente della Pergamena**: `VCPSJQRO`
- **Parola Verme (Chiave)**: `MORTEPEE`
- **Formula**: Incrocio riga-colonna nella Tabula Recta, equivalente a:
  $$P_i = (Index(C_i) + Index(K_i)) \pmod{25}$$

Dettaglio del calcolo per ciascuna lettera:
1. $V (22) + M (13) = 35 \equiv 10 \longrightarrow \mathbf{J}$
2. $C (3) + O (15) = 18 \longrightarrow \mathbf{R}$
3. $P (16) + R (18) = 34 \equiv 9 \longrightarrow \mathbf{I}$
4. $S (19) + T (20) = 39 \equiv 14 \longrightarrow \mathbf{N}$
5. $J (10) + E (5) = 15 \longrightarrow \mathbf{O}$
6. $Q (17) + P (16) = 33 \equiv 8 \longrightarrow \mathbf{H}$
7. $R (18) + E (5) = 23 \longrightarrow \mathbf{X}$
8. $O (15) + E (5) = 20 \longrightarrow \mathbf{T}$

**Risultato ottenuto**: **`JRINOHXT`**  
Il risultato coincide in modo perfetto e rigoroso con l'esempio indicato da Francesca.

---

## 2. Le Due Scacchiere del Salto del Cavallo

### A. Validità Geometrica dei Due Tour
Entrambe le matrici fotografate (Reperti 2 e 3) sono state sottoposte a validazione informatica formale:
- Tutte le 64 caselle contengono numeri interi univoci da **1 a 64**.
- Ogni salto da $k$ a $k+1$ rispetta la mossa canonica del cavallo nel gioco degli scacchi ($|\Delta x|=1, |\Delta y|=2$ oppure $|\Delta x|=2, |\Delta y|=1$).
- La **Scacchiera 2** è l'esatta inversione speculare verticale della **Scacchiera 1** (la riga 1 della Scacchiera 2 corrisponde alla riga 8 della Scacchiera 1).

### B. Conferma delle Corrispondenze di Posizione
Come intuito da Francesca, l'assegnazione delle caselle segue le matrici:

#### Scacchiera 1 (Tour Standard):
- Posizione 1 (riga 1, colonna 1) $\longrightarrow$ **60**
- Posizione 2 (riga 1, colonna 2) $\longrightarrow$ **15**
- Posizione 9 (riga 2, colonna 1) $\longrightarrow$ **47**

#### Scacchiera 2 (Tour Invertito):
- Posizione 1 (riga 1, colonna 1) $\longrightarrow$ **25**
- Posizione 2 (riga 1, colonna 2) $\longrightarrow$ **50**
- Posizione 9 (riga 2, colonna 1) $\longrightarrow$ **12**

### C. Le Due Modalità di Permutazione Implementate
Per offrire al lettore la massima flessibilità di indagine, il programma implementa entrambe le prospettive con un comodo selettore:
1. **Modalità Scatter (Disposizione su Numero)**:
   La lettera in posizione $i$ viene collocata nella destinazione indicata dal valore della casella $i$ ($1 \to 60, 2 \to 15$, ecc.).
2. **Modalità Gather (Raccolta per Ordine dei Passi)**:
   Il testo risultante viene composto prelevando sequenzialmente le lettere dalle caselle nell'ordine dei passi $1, 2, 3 \dots 64$.
3. **Opzione Inversa**:
   Un interruttore permette di invertire la permutazione, consentendo di ripristinare il testo originale o di decifrare un testo già permutato.

---

## 3. Guida alla Fruizione per il Lettore e QR Code

1. **Zero Dipendenze**: L'applicazione è racchiusa in tre file leggeri (`index.html`, `style.css`, `app.js`) ed è funzionante offline su qualunque browser moderno (Chrome, Safari, Brave, Firefox, Android e iOS).
2. **Mobile-First**: L'interfaccia si adatta dinamicamente allo schermo di uno smartphone, permettendo al lettore che scansiona il QR code dal libro cartaceo di:
   - Visualizzare la scacchiera interattiva e cliccare su ogni casella per vederne i dettagli.
   - Osservare il cavallo muoversi passo dopo passo lungo il percorso.
   - Consultare la Tabula Recta $25 \times 25$ originale.
   - Copiare i risultati negli appunti con un solo tocco e inviarli da un modulo all'altro.
