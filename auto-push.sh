#!/bin/bash

echo "Dodawanie wszystkich zmian..."
git add .

echo "Podaj komunikat commita:"
read commit_message

echo "Wykonywanie commita..."
git commit -m "$commit_message"

echo "Wysyłanie zmian do GitHuba..."
git push origin main

echo "Gotowe!"