async function main() {
  try {
    const response = await fetch("http://localhost:3000/api/analyze-argument", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ argument: "Los seres humanos somos omnívoros por evolución fáctica." })
    });
    console.log("Status:", response.status);
    const data = await response.json();
    console.log("Data:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error connecting to server:", err);
  }
}
main();
