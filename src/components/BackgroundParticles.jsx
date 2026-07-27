import "./BackgroundParticles.css";

export default function BackgroundParticles() {

    const particles = Array.from({ length: 20 });

    return (
        <div className="particles">

            {particles.map((_, index) => (

                <span
                    key={index}
                    className="particle"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 12}s`,
                        animationDuration: `${12 + Math.random() * 10}s`
                    }}
                />

            ))}

        </div>
    );

}