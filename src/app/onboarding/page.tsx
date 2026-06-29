'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
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
    <main className="min-h-screen bg-gradient-to-b from-blue-50/50 via-background to-background dark:from-blue-950/15 dark:via-background dark:to-background transition-colors duration-300 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2 font-sans">Set Up Your Homestay</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Welcome to GuestPulse AI! Tell us about your homestay business to customize your dashboard and analytics.
          </p>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border p-8 transition-colors duration-300">
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
                <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
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
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
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
                <Home className="w-4 h-4 text-blue-600 dark:text-blue-400" />
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
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
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
              className="w-full mt-2 bg-blue-600 dark:bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-blue-400 dark:disabled:bg-blue-800 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors cursor-pointer"
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
