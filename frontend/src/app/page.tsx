// pages/index.js
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Trivia Game | Play & Challenge</title>
      </Head>

      <main className="bg-background text-foreground min-h-screen">
        {/* Hero Section */}
        <section className="hero-section flex flex-col items-center justify-center h-screen bg-gradient-to-r from-primary to-secondary text-primary-foreground">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-center">
            Welcome to <span className="text-accent">Trivia Battle</span>
          </h1>
          <p className="text-lg md:text-2xl text-center max-w-xl">
            Join the most exciting, real-time trivia game! Answer questions,
            compete with others, and rise to the top.
          </p>
          <button className="mt-8 bg-accent hover:bg-accent-foreground text-primary-foreground font-semibold py-3 px-6 rounded-full text-lg transition duration-300">
            Start Playing
          </button>
        </section>

        {/* How it Works Section */}
        <section className="py-16 px-4 bg-card">
          <h2 className="text-4xl text-center font-bold mb-12 text-card-foreground">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-primary rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl">🎮</span>
              </div>
              <h3 className="text-2xl font-semibold text-card-foreground">Step 1: Join a Room</h3>
              <p className="mt-4 text-muted-foreground">
                Pick a room or create one, invite your friends, and prepare to
                battle in trivia!
              </p>
            </div>
            <div className="text-center">
              <div className="bg-secondary rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl">🧠</span>
              </div>
              <h3 className="text-2xl font-semibold text-card-foreground">
                Step 2: Answer Questions
              </h3>
              <p className="mt-4 text-muted-foreground">
                Show off your knowledge by answering questions in real-time
                against other players.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-accent rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl">🏆</span>
              </div>
              <h3 className="text-2xl font-semibold text-card-foreground">
                Step 3: Win and Earn Rewards
              </h3>
              <p className="mt-4 text-muted-foreground">
                Rack up points based on how fast and accurate you are. Win
                rewards and unlock achievements!
              </p>
            </div>
          </div>
        </section>

        {/* Call-to-Action Section */}
        <section className="bg-gradient-to-r from-primary to-secondary py-12 text-center text-primary-foreground">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Take the Challenge?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join now and start battling other players in real-time trivia!
          </p>
          <button className="bg-accent hover:bg-accent-foreground text-primary-foreground font-semibold py-3 px-6 rounded-full text-lg transition duration-300">
            Play Now
          </button>
        </section>
      </main>
    </>
  );
}
