export function validateTitle(v: string): string {
  if (!v.trim()) return "Please enter a title.";
  if (v.trim().length < 5) return "Title is a bit short. Make it descriptive.";
  return "";
}

export function validateChoice(v: string): string {
  if (!v.trim()) return "Please describe what you chose.";
  return "";
}

export function validateExpectedOutcome(v: string): string {
  if (!v.trim()) return "Please describe what you expect to happen.";
  return "";
}

export function expectedOutcomeHint(v: string): string {
  if (v.trim() && !/\d/.test(v)) {
    return "Tip: add a number (a count, %, amount or date) so it can be checked later.";
  }
  return "";
}

export function validateReviewDate(v: string): string {
  if (!v) return "Please pick a review date.";
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
  if (v <= today) return "Pick a date after today so there is time for results to show.";
  return "";
}