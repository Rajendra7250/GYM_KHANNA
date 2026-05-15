/* ===== Exercise Library Module ===== */
const ExerciseLibrary = (() => {
  const categories = [
    {
      name: "Chest",
      exercises: ["Bench Press", "Incline Bench Press", "Dumbbell Flyes", "Push Ups", "Cable Crossover"]
    },
    {
      name: "Back",
      exercises: ["Deadlift", "Pull Ups", "Barbell Row", "Lat Pulldown", "Seated Cable Row"]
    },
    {
      name: "Legs",
      exercises: ["Squat", "Leg Press", "Romanian Deadlift", "Lunges", "Leg Curl", "Calf Raises"]
    },
    {
      name: "Shoulders",
      exercises: ["Overhead Press", "Lateral Raises", "Face Pulls", "Arnold Press"]
    },
    {
      name: "Arms",
      exercises: ["Barbell Curl", "Tricep Pushdown", "Hammer Curl", "Skull Crushers"]
    },
    {
      name: "Core",
      exercises: ["Plank", "Crunches", "Hanging Leg Raise", "Cable Woodchop"]
    },
    {
      name: "Cardio",
      exercises: ["Running", "Cycling", "Jump Rope", "Rowing"]
    }
  ];

  function populateSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;

    // Clear existing options except the first placeholder
    while (select.options.length > 1) {
      select.remove(1);
    }
    
    // Remove old optgroups if any
    Array.from(select.getElementsByTagName('optgroup')).forEach(el => el.remove());

    categories.forEach(cat => {
      const group = document.createElement('optgroup');
      group.label = cat.name;
      cat.exercises.forEach(ex => {
        const option = document.createElement('option');
        option.value = ex;
        option.textContent = ex;
        group.appendChild(option);
      });
      select.appendChild(group);
    });
  }

  return { categories, populateSelect };
})();
