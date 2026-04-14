# Token Frequency Analyzer for Programming Code
---

🔗 **Live Demo:** https://token-frequency-counter.vercel.app/

---
## 📌 Overview

This project is a web-based tool that demonstrates the **Lexical Analysis phase of a compiler** by tokenizing source code and analyzing token frequency.

The system processes input code, converts it into a structured stream of tokens using a **custom Finite State Machine (FSM)-based tokenizer**, and provides interactive visualizations for better understanding.

It supports **multiple programming languages**, making it flexible while maintaining a focused scope on lexical analysis.

---

## 🎯 Objectives

- Implement a **manual tokenizer** using FSM-based logic  
- Classify tokens into:
  - Keywords  
  - Identifiers  
  - Operators  
  - Literals  
  - Delimiters  
- Analyze and display token frequency  
- Visualize token flow and recognition  
- Support **multi-language tokenization**

---

## ⚙️ Tech Stack

- **Frontend:** React, Tailwind CSS  
- **Visualization:** Chart.js / Recharts  
- **Core Logic:** JavaScript (Custom FSM-based tokenizer)

---

## 🌐 Supported Languages

- C  
- C++  
- Python  
- Java  

> The tokenizer adapts keyword recognition based on the selected language while maintaining a unified lexical analysis pipeline.

---

## 🧠 Features

### 1. Code Input
- Users can enter or paste source code
- Clean editor interface for structured input

---

### 2. Tokenization Engine
- Custom-built lexical analyzer (no external libraries)
- Processes code using deterministic FSM logic
- Generates an ordered token stream

---

### 3. Token Stream View

Displays tokens in sequence:

```
[int] [x] [=] [10] [;]
```

- Color-coded by token type  
- Reflects real-time lexical scanning behavior  

---

### 4. Token Classification Table

Displays:
- Token  
- Type  
- Frequency  

Interactive:
- Selecting a token highlights all occurrences  

---

### 5. Frequency Analysis

- Visual representation of token distribution  
- Helps identify structural patterns in code  

---

### 6. Error Detection

Detects:
- Invalid tokens  
- Unknown symbols  
- Unterminated literals  

Provides:
- Error message  
- Position reference  

---

### 7. Finite Automata Visualization

- Demonstrates token recognition using simplified DFA models  
- Covers:
  - Identifiers  
  - Numeric literals  

---

## 🧪 Example

**Input:**
```
int x = 10;
```

**Output:**
- Tokens: int, x, =, 10, ;  

**Classification:**
- int → Keyword  
- x → Identifier  
- = → Operator  
- 10 → Literal  

---

## 📂 Project Structure

```
src/
  components/
  utils/
    tokenizer.js
  styles/
```

---

## 🚀 How to Run

```bash
npm install
npm start
```

---

## 🧭 Future Improvements

- File upload support  
- Performance handling for large inputs  
- More advanced DFA simulations  
- Language-specific token rules expansion  

---

## 📚 Learning Outcome

This project demonstrates practical understanding of:

- Lexical Analysis  
- Tokenization techniques  
- Finite Automata (DFA)  
- Compiler Design fundamentals  
- Multi-language lexical processing  

---

## 👩‍💻 Author

Hiya Jain and Nayana Dinesh
