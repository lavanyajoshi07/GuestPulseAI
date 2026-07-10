'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ShaderBackground from '@/components/ShaderBackground';
import { Building2, MapPin, Home, FileText, Loader2, AlertCircle } from 'lucide-react';

function OnboardingContent() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();

  const [homestayName, setHomestayName] = useState('');
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('Villa');
  const [description, setDescription] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/homestay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homestayName,
          location,
          propertyType,
          description,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to configure homestay');
      }

      completeOnboarding();
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-y-auto">
      <ShaderBackground />
      <div className="w-full max-w-xl relative z-10 my-8">
        <div className="bg-white/90 dark:bg-black/45 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/10 shadow-2xl p-8 transition-all duration-300">
          <div className="flex flex-col items-center mb-6">
            <div className="text-black dark:text-white mb-2">
              <Building2 className="w-10 h-10 text-[#00C2A9] dark:text-[#00C2A9]" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1 text-center">Set Up Your Homestay</h1>
            <p className="text-muted-foreground text-xs text-center max-w-md mx-auto">
              Welcome to GuestPulse AI! Tell us about your homestay business to customize your dashboard and analytics.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Homestay Name */}
            <div>
              <label htmlFor="homestayName" className="block text-sm font-semibold text-foreground mb-1.5 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#00C2A9] dark:text-[#00C2A9]" />
                Homestay Name *
              </label>
              <input
                id="homestayName"
                type="text"
                value={homestayName}
                onChange={(e) => setHomestayName(e.target.value)}
                placeholder="e.g. Whispering Pines Heritage Cottage"
                className="w-full px-4 py-2.5 bg-background border border-border text-foreground rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={isLoading}
                required
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-foreground mb-1.5 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00C2A9] dark:text-[#00C2A9]" />
                Location *
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Manali, Himachal Pradesh"
                className="w-full px-4 py-2.5 bg-background border border-border text-foreground rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={isLoading}
                required
              />
            </div>

            {/* Property Type */}
            <div>
              <label htmlFor="propertyType" className="block text-sm font-semibold text-foreground mb-1.5 flex items-center gap-2">
                <Home className="w-4 h-4 text-[#00C2A9] dark:text-[#00C2A9]" />
                Property Type *
              </label>
              <select
                id="propertyType"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border text-foreground rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors cursor-pointer"
                disabled={isLoading}
                required
              >
                <option value="Villa">Villa</option>
                <option value="Cottage">Cottage</option>
                <option value="Apartment">Apartment</option>
                <option value="Treehouse">Treehouse</option>
                <option value="Farmstay">Farmstay</option>
                <option value="Heritage Home">Heritage Home</option>
                <option value="Eco Resort">Eco Resort</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-foreground mb-1.5 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#00C2A9] dark:text-[#00C2A9]" />
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of your homestay property, amenities, or experience..."
                className="w-full px-4 py-2.5 bg-background border border-border text-foreground rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                rows={3}
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !homestayName.trim() || !location.trim()}
              className="w-full mt-2 bg-[#00C2A9] dark:bg-[#00C2A9] text-white py-3 rounded-lg font-semibold hover:bg-[#00A38E] dark:hover:bg-[#00A38E] disabled:bg-[#00C2A9]/50 dark:disabled:bg-[#00C2A9]/50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving Homestay...
                </>
              ) : (
                'Save Homestay & Continue to Dashboard'
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <OnboardingContent />
    </ProtectedRoute>
  );
}
