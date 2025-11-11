export default function Footer() {
  return (
    <footer className="bg-[#1c1c1c] text-white py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Transport Information */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 text-sm">
            {/* DLR/Rail Stations */}
            <div>
              <h3 className="text-white font-semibold mb-3 tracking-wider">Nearest DLR / Rail Stations</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#DC143C] transition-colors">
                    Royal Victoria DLR Station
                  </a>
                  <span className="block text-xs text-gray-500">approx 1 min walk</span>
                </li>
                <li>
                  <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#DC143C] transition-colors">
                    Custom House for ExCeL (DLR & Elizabeth Line)
                  </a>
                  <span className="block text-xs text-gray-500">approx 9-12 min walk</span>
                </li>
              </ul>
            </div>

            {/* Bus Stops */}
            <div>
              <h3 className="text-white font-semibold mb-3 tracking-wider">Nearest Bus Stops & Routes</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#DC143C] transition-colors">
                    Munday Road / Royal Victoria (Stop J)
                  </a>
                  <span className="block text-xs text-gray-500">towards Canning Town & beyond</span>
                  <span className="block text-xs text-gray-500">Bus Nos: 147, 474, N551</span>
                </li>
                <li>
                  <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#DC143C] transition-colors">
                    Seagull Lane (Stop S)
                  </a>
                  <span className="block text-xs text-gray-500">short walk from studio</span>
                  <span className="block text-xs text-gray-500">Bus No: SCS</span>
                </li>
              </ul>
            </div>

            {/* Bike Parking */}
            <div>
              <h3 className="text-white font-semibold mb-3 tracking-wider">Bike Parking</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Cyclists are welcome! Secure bike-parking/locking facilities are available near the studio entrance for chaining your bike safely.
              </p>
            </div>

            {/* Car Parking */}
            <div>
              <h3 className="text-white font-semibold mb-3 tracking-wider">Car Parking & Driving</h3>
              <div className="text-gray-400 text-xs leading-relaxed space-y-2">
                <p>If you're driving:</p>
                <p>Park on 232-236 Victoria Dock Road, E16 (opposite Royal Victoria DLR Station) — just a short walk over the bridge to the studio entrance.</p>
                <p className="text-gray-500">On-street/driveway spaces near Victoria Dock Road start at approximately £1.10 per hour. (justpark.com)</p>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="text-center border-t border-gray-700 pt-8">
            <p className="text-sm text-gray-400 mb-4">
              EASTDOC STUDIOS is a part of the Acumen International Media Family.
              Acumen is an Award Winning International Film Production and Distribution
              media group, specialising in crafting stories and sharing insights from the
              business world, through the power of cinematic visuals.
            </p>
            <p className="text-xs text-gray-500">
              ©2024 EASTDOC STUDIOS Copyright All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
