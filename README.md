# 💸 SplitEase

A clean, minimal **group expense splitter** built with React — like a mini Splitwise. Add members, log shared expenses, and instantly see who owes whom with the fewest possible payments.

![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![No Backend](https://img.shields.io/badge/Backend-None-blueviolet?style=flat-square)

---

## ✨ Features

- **Group Setup** — Name your group and add up to 8 members with auto-assigned color avatars
- **Expense Logging** — Record who paid, how much, and who it's split among (any subset)
- **Smart Emoji Detection** — Auto-assigns icons based on expense description (food, hotel, cab, drinks, etc.)
- **Balances View** — See each member's net balance, total paid vs. share owed, and contribution bar
- **Settle Up** — Greedy debt-simplification algorithm that calculates the **minimum number of payments** needed to settle all debts
- **Fully client-side** — No backend, no database, no login required

---

## 🖥️ Demo

> _Setup → Add expenses → Check balances → Settle up_

| Setup | Expenses | Balances | Settle Up |
|---|---|---|---|
| Name group & add members | Log who paid & split among whom | See net balances per person | Minimum transactions to clear debts |

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/your-username/splitease.git
cd splitease
```

### 2. Install dependencies
```bash
npm install
```

### 3. Replace the default App
Copy `SplitEase.jsx` into `src/App.js` (or import it as a component).

### 4. Run
```bash
npm start
```

App runs at `http://localhost:3000`

---

## 🧠 How the Algorithm Works

The **Settle Up** feature uses a greedy debt-simplification algorithm:

1. Calculate each person's **net balance** (total paid − total share owed)
2. Separate into **creditors** (positive balance) and **debtors** (negative balance)
3. Greedily match the largest creditor with the largest debtor
4. Record the transaction and reduce both balances
5. Repeat until all balances reach zero

This minimizes the number of transactions needed — for example, 5 people with 10 expenses might only need 3 payments to settle everything.

```js
function calculateSettlements(balances) {
  const pos = /* creditors sorted descending */;
  const neg = /* debtors sorted ascending */;

  while (creditors and debtors remain) {
    const amt = Math.min(pos[i].amount, neg[j].amount);
    record: neg[j] pays pos[i] ← amt
    reduce both balances
  }
}
```

---

## 🗂️ Project Structure

```
src/
├── App.js          # Main SplitEase component (all-in-one)
└── index.js        # React entry point
```

> All logic and UI lives in a single component file — great for reading and understanding the full flow end-to-end.

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Framework | React 18 (Hooks) |
| Styling | Inline styles + injected CSS |
| Fonts | Syne (UI) + DM Mono (numbers) via Google Fonts |
| State | `useState` only — no Redux, no Context |
| Data | In-memory (no localStorage, no backend) |

---

## 🔮 Possible Extensions

- [ ] Persistent storage with `localStorage` or Firebase
- [ ] Export settlements as PDF or share via link
- [ ] Currency selector (₹, $, €, £)
- [ ] Edit / delete expenses
- [ ] Percentage-based or custom-amount splits
- [ ] PWA support for offline use

---

## 👤 Author

**Saad** — B.Tech CSE (AI & ML), Brainware University  
Student Code: BWU/BTA/24/088

---

## 📄 License

MIT — free to use, modify, and distribute.
