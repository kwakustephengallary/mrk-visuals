export default function Portfolio() {
  return (
    <div className="min-h-screen bg-white pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-light text-center mb-12">Our Portfolio</h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          {portfolio.map((item, index) => (
            <div key={index} className="group relative overflow-hidden rounded-lg aspect-square bg-gray-200">
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                <p className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-lg font-semibold">
                  {item.title}
                </p>
              </div>
              <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-4xl">
                📷
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const portfolio = [
  { title: 'Weddings', image: '' },
  { title: 'Events', image: '' },
  { title: 'Portraits', image: '' },
  { title: 'Commercial', image: '' },
  { title: 'Cinematography', image: '' },
  { title: 'Behind the Scenes', image: '' },
];