function Sky({ type }) {
  return (
    <>
      <img
        src={`/images/${type}.png`}
        alt={type}
        className="sky-image"
      />

      <div className="sky-overlay"></div>
    </>
  );
}

export default Sky;