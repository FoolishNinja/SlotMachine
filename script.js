var instance = null;
var startMoney = 1000000;
var startBet = 10000;

class App {
    constructor() {
        this.LoadAssets();
    }

    BindButtons() {
        document.getElementById('increase-amount-button').onclick = () => this.IncreaseBet();
        document.getElementById('decrease-amount-button').onclick = () => this.DecreaseBet();
        document.getElementById('spin-container').onclick = () => this.Roll();
    }

    LoadAssets() {
        this.BindButtons();
        this.tiles = [
            {
                name: 'J',
                rarity: 4000,
                color: 'gray',
                payout: 0.7
            },
            {
                name: 'Q',
                rarity: 3000,
                color: 'blue',
                payout: 1.1
            },
            {
                name: 'K',
                rarity: 1500,
                color: 'green',
                payout: 1.5
            },
            {
                name: 'A',
                rarity: 1000,
                color: 'red',
                payout: 2.5
            },
            {
                name: '7',
                rarity: 500,
                color: 'yellow',
                payout: 5
            },
            {
                name: 'WILD',
                rarity: 300,
                color: 'pink',
                payout: 10
            },
            {
                name: 'JACKPOT',
                rarity: 100,
                color: 'gold',
                payout: 20
            }
        ];
        this.tickets = [];
        this.tiles.forEach(tile => {
            for (let i = 0; i < tile.rarity; i++) this.tickets.push(tile);
        })
        this.rows = [];
        for (let i = 0; i < 5; i++) this.rows.push(document.getElementById(`row-${i + 1}`));
        this.totalMoneyContainer = document.getElementById('total-money-container');
        this.betAmountContainer = document.getElementById('spin-amount');
        this.currentMoney = 0;
        this.betAmount = 0;
        this.totalSpins = 0;
        this.SetCurrentMoney(startMoney);
        this.SetBetAmount(startBet);
        this.InitializeLines();
        this.InitializeField();
    }

    InitializeLines() {
        this.lines = [
            [0, 0, 0, 0, 0],
            [1, 1, 1, 1, 1],
            [2, 2, 2, 2, 2],
            [0, 1, 2, 1, 0],
            [2, 1, 0, 1, 2],
            [1, 0, 0, 0, 1],
            [1, 2, 2, 2, 1],
            [0, 0, 1, 2, 2],
            [2, 2, 1, 0, 0],
            [1, 2, 1, 0, 1],
            [1, 0, 1, 2, 1],
            [0, 1, 1, 1, 0],
            [2, 1, 1, 1, 0],
            [0, 1, 0, 1, 0],
            [2, 1, 2, 1, 2],
            [1, 1, 0, 1, 1],
            [1, 1, 2, 1, 1],
            [0, 0, 2, 0, 0],
            [2, 2, 0, 2, 2],
            [0, 2, 2, 2, 0],
            [2, 0, 0, 0, 2],
            [1, 2, 0, 2, 1],
            [1, 0, 2, 0, 1],
            [0, 2, 0, 2, 0],
            [2, 0, 2, 0, 2]
        ];
    }

    InitializeField() {
        for (let i = 0; i < 5; i++) {
            for (let y = 0; y < 3; y++) this.AddTileToRow(i, y === 1 ? { name: 'JACKPOT', color: 'gold' } : { name: 'WILD', color: 'pink' });
        }
    }

    Roll() {
        this.field = [[], [], [], [], []];
        for (let i = 0; i < 5; i++) this.RandomizeRow(i);
        this.SetCurrentMoney(this.currentMoney - this.betAmount);
        this.CountLines();
        this.totalSpins++;
    }

    CountLines() {
        let price = 0;
        this.lines.forEach(line => {
            let tiles = [];
            let tileAmount = 0;
            line.forEach((position, index) => {
                tiles.push(this.field[position][index]);
            });
            let possiblePayout = 0;
            if (tiles[1].name !== 'WILD' && tiles[1].name !== tiles[0].name
            ) possiblePayout = 0;
            else if ((tiles[1].name === 'WILD' || tiles[1].name === tiles[0].name) &&
                (tiles[2].name === 'WILD' || tiles[2].name === tiles[1].name) &&
                (tiles[3].name === 'WILD' || tiles[3].name === tiles[2].name) &&
                (tiles[4].name === 'WILD' || tiles[4].name === tiles[3].name)
            ) {
                possiblePayout = tiles[0].payout;
                tileAmount = 5;
            }
            else if ((tiles[1].name === 'WILD' || tiles[1].name === tiles[0].name) &&
                (tiles[2].name === 'WILD' || tiles[2].name === tiles[1].name) &&
                (tiles[3].name === 'WILD' || tiles[3].name === tiles[2].name)
            ) {
                possiblePayout = tiles[0].payout * 0.75;
                tileAmount = 4;
            }
            else if ((tiles[1].name === 'WILD' || tiles[1].name === tiles[0].name) &&
                (tiles[2].name === 'WILD' || tiles[2].name === tiles[1].name)
            ) {
                possiblePayout = tiles[0].payout / 2;
                tileAmount = 3;
            }
            price += possiblePayout * this.betAmount;
            if (tileAmount > 2) this.ColorTiles(line, tileAmount);
        });
        this.SetCurrentMoney(this.currentMoney + price);
    }

    ColorTiles(line, tileAmount) {
        const color = this.GetRandomColor();
        line.forEach((tile, index) => {
            if (index >= tileAmount) return;
            this.rows[index].childNodes[tile].style['background-color'] = color;
        })
    }

    GetRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    RandomizeRow(rowId) {
        this.rows[rowId].innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const rmdTile = this.GetRandomTile();
            this.field[i].push(rmdTile);
            this.AddTileToRow(rowId, rmdTile);
        }
    }

    AddTileToRow(rowId, tileValue) {
        let tile = document.createElement('div');
        tile.innerHTML = tileValue.name;
        tile.style['font-size'] = tileValue.name === 'JACKPOT' ? '90px' : undefined;
        tile.style['border-bottom'] = this.rows[rowId].childNodes.length === 4 ? 'none' : undefined;
        tile.style.color = tileValue.color;
        this.rows[rowId].appendChild(tile);
    }

    GetRandomTile() {
        return this.tickets[Math.floor(Math.random() * this.tickets.length)];
    }

    SetCurrentMoney(amount) {
        this.currentMoney = amount;
        this.totalMoneyContainer.innerHTML = amount;
    }

    SetBetAmount(amount) {
        this.betAmount = amount;
        this.betAmountContainer.innerHTML = amount;
    }

    IncreaseBet() {
        this.SetBetAmount(this.betAmount * 2 > this.currentMoney ? this.currentMoney : this.betAmount * 2);
    }

    DecreaseBet() {
        this.SetBetAmount(this.betAmount / 2 < 100 ? 100 : Math.floor(this.betAmount / 2));
    }
}

function Start() {
    instance = new App();
}