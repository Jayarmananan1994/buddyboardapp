import TripForm from '../components/TripForm';
import FloatingFeedbackButton from '../components/FloatingFeedbackButton';
import { isAuthenticated } from '../services/authService';
import { Link } from 'react-router-dom';

function CreateTripPage() {
  const userIsAuthenticated = isAuthenticated();

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create a Trip</h1>
        <p className="mt-1 text-slate-500">Share your travel plans and find the perfect travel buddy.</p>
      </div>

      {/* Anonymous User Disclaimer */}
      {!userIsAuthenticated && (
        <div className="mb-6 rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-yellow-600 mt-0.5">warning</span>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 mb-1">Posting as Anonymous</h3>
              <p className="text-sm text-yellow-800 mb-2">
                You are not signed in. Your trip will be posted anonymously and <strong>cannot be edited or deleted</strong> later.
              </p>
              <Link
                to="/signin"
                className="inline-flex items-center gap-1 text-sm font-medium text-yellow-900 hover:text-yellow-950 underline"
              >
                <span className="material-symbols-outlined text-base">login</span>
                Sign in to post with your account
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Trip Form */}
      <TripForm />

      {/* Floating Feedback Button */}
      <FloatingFeedbackButton />
    </>
  );
}

export default CreateTripPage;