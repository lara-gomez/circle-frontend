<template>
  <div class="hello">
    <h2>Hello World Component</h2>
    <p>This is a sample Vue component to get you started.</p>
    
    <div class="counter">
      <p>Counter: {{ count }}</p>
      <button @click="increment">Increment</button>
      <button @click="decrement">Decrement</button>
    </div>
    
    <div class="features">
      <h3>Vue.js Features Demonstrated:</h3>
      <ul>
        <li>Reactive data binding</li>
        <li>Event handling</li>
        <li>Component composition</li>
        <li>Template syntax</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data() {
    return {
      count: 0
    }
  },
  methods: {
    increment() {
      this.count++
    },
    decrement() {
      this.count--
    }
  }
}
</script>

<style scoped>
.hello {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

h2 {
  color: #42b883;
  margin-bottom: 1rem;
}

.counter {
  margin: 2rem 0;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.counter p {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

button {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  margin: 0 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

button:hover {
  background-color: #369870;
}

button:active {
  transform: translateY(1px);
}

.features {
  margin-top: 2rem;
  text-align: left;
}

.features h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.features ul {
  list-style-type: none;
  padding: 0;
}

.features li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.features li:last-child {
  border-bottom: none;
}

.features li::before {
  content: "✓ ";
  color: #42b883;
  font-weight: bold;
}
</style>
