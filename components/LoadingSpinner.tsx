import { Crown } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="relative">
        <Crown className="w-16 h-16 text-empire-gold animate-pulse" />
        <div className="absolute inset-0 animate-spin">
          <div className="w-16 h-16 border-4 border-transparent border-t-empire-gold rounded-full"></div>
        </div>
      </div>
      <p className="mt-4 text-gray-400">{message}</p>
    </div>
  );
}
