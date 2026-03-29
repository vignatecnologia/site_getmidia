
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5cnV3ZWlkcWxxbmlxZGF0bnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2ODY0NjcsImV4cCI6MjA4MzI2MjQ2N30.ZWdA00qDxxw06EvK5jyQZGmdJTGY1nHOwUm7x6FzDV0";
const payload = JSON.parse(atob(key.split('.')[1]));
console.log(payload);
