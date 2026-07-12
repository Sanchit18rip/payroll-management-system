function Sky({ type }) {
  return (
    <>
      <img
        src={`${import.meta.env.BASE_URL}images/${type}.png`}
        alt={type}
        className="sky-image"
      />

      <div className="sky-overlay"></div>
    </>
  );
}

export default Sky;