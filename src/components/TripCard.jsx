import Button from './Button';

function TripCard({ trip }) {
  const handleShowInterest = () => {
    console.log('Show interest clicked for:', trip.destination);
  };

  const handleViewDetail = () => {
    console.log('View detail clicked for:', trip.destination);
  };

  // Contact styling based on type
  const getContactStyling = (type) => {
    switch (type) {
      case 'telegram':
        return 'bg-blue-100 text-blue-800';
      case 'whatsapp':
        return 'bg-green-100 text-green-800';
      case 'instagram':
        return 'bg-pink-100 text-pink-800';
      case 'discord':
        return 'bg-indigo-100 text-indigo-800';
      case 'email':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Render contact icon
  const renderContactIcon = (contact) => {
    if (contact.icon === 'instagram') {
      return (
        <svg className="bi bi-instagram" fill="currentColor" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372.525-.204.97-.478 1.416-.923.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.282.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.598-.919c-.11-.282-.24-.705-.276-1.485C1.442 10.445 1.434 10.173 1.434 8s.008-2.388.047-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.843-.038 1.096-.047 3.232-.047zM8 4.865a3.135 3.135 0 1 0 0 6.27 3.135 3.135 0 0 0 0-6.27zM8 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.885-8.465a1.144 1.144 0 1 0-2.288 0 1.144 1.144 0 0 0 2.288 0z"></path>
        </svg>
      );
    } else if (contact.icon === 'whatsapp') {
      return (
        <svg className="bi bi-whatsapp" fill="currentColor" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"></path>
        </svg>
      );
    } else {
      return <span className="material-symbols-outlined text-base">{contact.icon}</span>;
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg">
      {/* Trip Image or Placeholder */}
      {trip.image ? (
        <div
          className="relative h-48 w-full bg-cover bg-center"
          style={{ backgroundImage: `url("${trip.image}")` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-4">
            <h3 className="text-xl font-bold text-white">{trip.destination}</h3>
            <p className="text-sm text-slate-200">{trip.dates}</p>
          </div>
        </div>
      ) : (
        <div className="relative h-48 w-full bg-slate-200 flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl text-slate-400">image_not_supported</span>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-4">
            <h3 className="text-xl font-bold text-white">{trip.destination}</h3>
            <p className="text-sm text-slate-200">{trip.dates}</p>
          </div>
        </div>
      )}

      {/* Trip Details */}
      <div className="p-4">
        <div className="mb-4 space-y-2 text-sm text-slate-600">
          {trip.startingFrom && (
            <p>
              <span className="font-medium text-slate-800">Starting From:</span> {trip.startingFrom}
            </p>
          )}
          <p>
            <span className="font-medium text-slate-800">Gender Pref:</span> {trip.genderPref}
          </p>

          {/* Contact with styled badge */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-800">Contact:</span>
            <div className={`flex items-center gap-1.5 truncate rounded-md px-2 py-1 text-xs font-medium ${getContactStyling(trip.contact.type)}`}>
              {renderContactIcon(trip.contact)}
              <span>{trip.contact.value}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={handleShowInterest}>
            Show Interest
          </Button>
          <Button variant="secondary" onClick={handleViewDetail}>
            View Detail
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TripCard;