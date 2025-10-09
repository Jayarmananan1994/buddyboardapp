import { Link } from 'react-router-dom';

function SignInPrompt({
  icon = 'luggage',
  title = '🧳 You haven\'t signed in yet',
  message = 'Sign in to view or manage your trips easily.',
  subtitle = 'Trips posted anonymously can\'t be edited or deleted.',
  buttonText = 'Sign In / Create Account',
  buttonIcon = 'key'
}) {
  return (
    <div className="flex flex-1 justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-5xl text-primary">{icon}</span>
          </div>

          <h3 className="text-2xl font-bold text-slate-900 mb-3">
            {title}
          </h3>

          <p className="text-slate-600 mb-2">
            {message}
          </p>
          {subtitle && (
            <p className="text-slate-500 text-sm mb-6">
              {subtitle}
            </p>
          )}

          <Link
            to="/signin"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-medium text-white hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined">{buttonIcon}</span>
            {buttonText}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SignInPrompt;
