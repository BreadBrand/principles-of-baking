import './landing.css';

const Landing = () => {
  return (
    <div className="landingContainer">
      <div className="heroImage" />
      <div className="heroText">
        <h1>Learn to make your own bread</h1>
        <h2>Making your own bread isn't as complicated as you might think.</h2>
      </div>
      <div className="glass noticeContainer">
        <div className='noticeText'>
          Learn about different preferments
        </div>
        <div className='noticeText'>
          Discover how to make high hydration dough
        </div>
        <div className='noticeText'>
          Find out how elevation can effect bake times and temperature requirements
        </div>
      </div>
      <div className="underViewContainer">
        <h1>Welcome to the Bread Machine</h1>
        <p>An app to help you scale your bread recipes and help you experiment!</p>
      </div>
    </div>
  )
}

export default Landing;
