import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Courier New, monospace",
      }}
    >
      <h1
        style={{
          color: "#FF0000",
          fontSize: "72px",
          marginBottom: "20px",
          textShadow: "4px 4px #FF00FF",
        }}
      >
        404
      </h1>
      <h2
        style={{
          color: "#00FF00",
          fontSize: "36px",
          marginBottom: "30px",
        }}
      >
        Task Failed Successfully
      </h2>
      <p
        style={{
          color: "#FFFF00",
          fontSize: "24px",
          textAlign: "center",
          maxWidth: "600px",
        }}
      >
        Congratulations! You have successfully failed to claim your prize.
        <br />
        <br />
        The prize has been awarded to someone more deserving.
        <br />
        <br />
        Better luck next time! (Just kidding, there is no next time.)
      </p>
      <Link
        href="/"
        style={{
          marginTop: "40px",
          color: "#FF00FF",
          fontSize: "20px",
          textDecoration: "underline",
        }}
      >
        Try Again (It won&#39;t help)
      </Link>
    </div>
  );
}
