/* ===== Exercise Library Module ===== */
const ExerciseLibrary = (() => {
  const categories = [
    {
      name: "Chest",
      exercises: ["Bench Press", "Incline Bench Press", "Decline Bench Press", "Dumbbell Flyes", "Push Ups", "Cable Crossover", "Machine Chest Press", "Pec Deck", "Dips"]
    },
    {
      name: "Back",
      exercises: ["Deadlift", "Pull Ups", "Chin Ups", "Barbell Row", "Dumbbell Row", "Lat Pulldown", "Seated Cable Row", "T-Bar Row", "Straight Arm Pulldown", "Good Mornings"]
    },
    {
      name: "Legs",
      exercises: ["Squat", "Front Squat", "Hack Squat", "Leg Press", "Romanian Deadlift", "Lunges", "Bulgarian Split Squat", "Leg Extension", "Leg Curl", "Calf Raises", "Hip Thrust"]
    },
    {
      name: "Shoulders",
      exercises: ["Overhead Press", "Dumbbell Shoulder Press", "Lateral Raises", "Front Raises", "Reverse Pec Deck", "Face Pulls", "Arnold Press", "Upright Row", "Shrugs"]
    },
    {
      name: "Arms",
      exercises: ["Barbell Curl", "Dumbbell Curl", "Preacher Curl", "Hammer Curl", "Cable Curl", "Tricep Pushdown", "Overhead Tricep Extension", "Skull Crushers", "Close Grip Bench Press", "Tricep Kickbacks"]
    },
    {
      name: "Core",
      exercises: ["Plank", "Crunches", "Sit Ups", "Hanging Leg Raise", "Ab Wheel Rollout", "Russian Twists", "Cable Woodchop", "Bicycle Crunches"]
    },
    {
      name: "Cardio",
      exercises: ["Running", "Cycling", "Jump Rope", "Rowing", "Stairmaster", "Elliptical", "Swimming"]
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
