import TripForm from '../components/TripForm';
import FloatingFeedbackButton from '../components/FloatingFeedbackButton';

function CreateTripPage() {
  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create a Trip</h1>
        <p className="mt-1 text-slate-500">Share your travel plans and find the perfect travel buddy.</p>
      </div>

      {/* Trip Form */}
      <TripForm />

      {/* Floating Feedback Button */}
      <FloatingFeedbackButton />
    </>
  );
}

export default CreateTripPage;