import React, { useEffect, useState } from 'react';
import {
  GiftIcon,
  TagIcon,
  ClockIcon,
  ArrowRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

import { userApi } from '../api';

const BLUE = '#2B46D5';
const GREEN = '#7CB80B';
const BG = '#F5F7FA';
const CARD = '#FFFFFF';
const BORDER = '#E8ECF0';
const TEXT = '#1A2332';
const MUTED = '#6B7A8F';
const LIGHT_BLUE = 'rgba(43, 70, 213, 0.06)';
const LIGHT_GREEN = 'rgba(124, 184, 11, 0.08)';

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await userApi.getActiveOffers();

      /*
       * Supports both:
       *
       * Axios:
       * response.data
       *
       * Or an axios interceptor that directly returns
       * the API response.
       */

      const payload = response?.data ?? response;

      if (Array.isArray(payload)) {
        setOffers(payload);
      } else if (Array.isArray(payload?.data)) {
        setOffers(payload.data);
      } else if (Array.isArray(payload?.offers)) {
        setOffers(payload.offers);
      } else if (Array.isArray(payload?.data?.offers)) {
        setOffers(payload.data.offers);
      } else {
        setOffers([]);
      }
    } catch (err) {
      console.error('Offers fetch error:', err);

      setError(
        err?.response?.data?.message ||
          'Failed to load offers. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return null;

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getOfferTitle = (offer) => {
    return (
      offer.title ||
      offer.name ||
      offer.offerName ||
      'Special Offer'
    );
  };

  const getOfferDescription = (offer) => {
    return (
      offer.description ||
      offer.details ||
      offer.offerDescription ||
      'Exclusive offer available for you.'
    );
  };

  const getOfferImage = (offer) => {
    return (
      offer.image ||
      offer.imageUrl ||
      offer.banner ||
      offer.bannerImage ||
      null
    );
  };

  const getOfferValue = (offer) => {
    return (
      offer.discount ||
      offer.discountPercentage ||
      offer.reward ||
      offer.rewardAmount ||
      offer.value ||
      null
    );
  };

  const getExpiryDate = (offer) => {
    return (
      offer.endDate ||
      offer.expiryDate ||
      offer.expiresAt ||
      offer.validUntil ||
      null
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div
            className="w-10 h-10 border-4 rounded-full animate-spin"
            style={{
              borderColor: '#E5E7EB',
              borderTopColor: BLUE,
            }}
          />

          <p className="mt-4 text-sm text-gray-500">
            Loading offers...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: BG }}
    >
      {/* Header */}
     {/* Header with Logo - Same as Referrals */}
<div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 text-white">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">

    {/* Left Section: Logo + Text Below */}
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="flex flex-col items-center">

        {/* Logo */}
        <div className="flex-shrink-0">
          <img
            src="/images/logo3.jpeg"
            alt="Logo"
            className="h-14 w-14 sm:h-12 sm:w-auto bg-transparent sm:bg-white rounded-lg p-0 sm:p-1 shadow-none sm:shadow-md object-contain"
          />
        </div>

        {/* Text Below Logo */}
        <div className="flex flex-col items-center mt-1">
          <p className="text-[10px] sm:text-xs text-blue-200 font-medium tracking-wide text-center">
            Asset - Wealth Management
          </p>

          <p className="text-[10px] sm:text-xs text-blue-200 font-medium tracking-wide text-center">
            Wealth | Trust | Growth
          </p>
        </div>

      </div>
    </div>

    {/* Right Section: Offers */}
    <div className="flex items-center justify-end gap-3 sm:gap-4 flex-1 min-w-0">

      <div className="text-right">
        <h1 className="text-lg sm:text-2xl font-bold truncate">
          Offers
        </h1>

        <p className="text-blue-100 text-xs sm:text-sm truncate">
          Explore our latest offers and rewards
        </p>
      </div>

      {/* Offers Icon */}
      <div className="flex items-center justify-center bg-white/10 p-2 sm:p-3 rounded-lg backdrop-blur-sm flex-shrink-0">
        <GiftIcon className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>

    </div>

  </div>
</div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {offers.length === 0 ? (
          <div
            className="bg-white rounded-2xl border text-center py-16 px-5"
            style={{ borderColor: BORDER }}
          >
            <div
              className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
              style={{ backgroundColor: LIGHT_BLUE }}
            >
              <GiftIcon
                className="w-8 h-8"
                style={{ color: BLUE }}
              />
            </div>

            <h2
              className="text-lg font-bold mt-5"
              style={{ color: TEXT }}
            >
              No Offers Available
            </h2>

            <p
              className="text-sm mt-2"
              style={{ color: MUTED }}
            >
              There are no active offers available at the moment.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2
                  className="text-xl font-bold"
                  style={{ color: TEXT }}
                >
                  Available Offers
                </h2>

                <p
                  className="text-sm mt-1"
                  style={{ color: MUTED }}
                >
                  {offers.length} active offer
                  {offers.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Offers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {offers.map((offer, index) => {
                const title = getOfferTitle(offer);
                const description = getOfferDescription(offer);
                const image = getOfferImage(offer);
                const value = getOfferValue(offer);
                const expiry = getExpiryDate(offer);

                return (
                  <div
                    key={offer.id || offer._id || index}
                    className="bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    style={{ borderColor: BORDER }}
                  >
                    {/* Image */}
                    {image ? (
                      <div className="h-44 bg-gray-100 overflow-hidden">
                        <img
                          src={image}
                          alt={title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className="h-44 flex items-center justify-center"
                        style={{
                          backgroundColor: LIGHT_BLUE,
                        }}
                      >
                        <GiftIcon
                          className="w-16 h-16"
                          style={{ color: BLUE }}
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3
                            className="text-lg font-bold"
                            style={{ color: TEXT }}
                          >
                            {title}
                          </h3>
                        </div>

                        {value && (
                          <div
                            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold"
                            style={{
                              color: GREEN,
                              backgroundColor: LIGHT_GREEN,
                            }}
                          >
                            {value}
                          </div>
                        )}
                      </div>

                      <p
                        className="text-sm leading-6 mt-3"
                        style={{ color: MUTED }}
                      >
                        {description}
                      </p>

                      {/* Expiry */}
                      {expiry && (
                        <div className="flex items-center gap-2 mt-4">
                          <ClockIcon
                            className="w-4 h-4"
                            style={{ color: MUTED }}
                          />

                          <span
                            className="text-xs"
                            style={{ color: MUTED }}
                          >
                            Valid until {formatDate(expiry)}
                          </span>
                        </div>
                      )}

                      {/* Offer ID / Tag */}
                      {offer.code && (
                        <div
                          className="flex items-center gap-2 mt-4 px-3 py-2 rounded-lg"
                          style={{
                            backgroundColor: '#F8FAFC',
                          }}
                        >
                          <TagIcon
                            className="w-4 h-4"
                            style={{ color: BLUE }}
                          />

                          <span
                            className="text-xs font-semibold"
                            style={{ color: TEXT }}
                          >
                            {offer.code}
                          </span>
                        </div>
                      )}

                      {/* Bottom */}
                      <div className="flex items-center justify-between mt-5 pt-4 border-t"
                        style={{ borderColor: BORDER }}
                      >
                        <span
                          className="text-xs font-medium"
                          style={{ color: GREEN }}
                        >
                          Active Offer
                        </span>

                        <button
                          onClick={() => {
                            if (offer.id || offer._id) {
                              window.location.href =
                                `/offers/${offer.id || offer._id}`;
                            }
                          }}
                          className="flex items-center gap-1.5 text-sm font-bold hover:opacity-75 transition"
                          style={{ color: BLUE }}
                        >
                          View Details
                          <ArrowRightIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Offers;