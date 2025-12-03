-- Insert rate settings for common countries
-- Run this in your Supabase SQL Editor

INSERT INTO
    public.rate_settings (
        country_code,
        country_name,
        cost_per_minute,
        sell_rate_per_minute,
        is_active
    )
VALUES (
        '+1',
        'United States',
        0.0085,
        0.02,
        true
    ),
    (
        '+44',
        'United Kingdom',
        0.0120,
        0.03,
        true
    ),
    (
        '+61',
        'Australia',
        0.0150,
        0.035,
        true
    ),
    (
        '+91',
        'India',
        0.0080,
        0.02,
        true
    ),
    (
        '+86',
        'China',
        0.0100,
        0.025,
        true
    ),
    (
        '+49',
        'Germany',
        0.0130,
        0.03,
        true
    ),
    (
        '+33',
        'France',
        0.0125,
        0.03,
        true
    ),
    (
        '+81',
        'Japan',
        0.0200,
        0.045,
        true
    ),
    (
        '+65',
        'Singapore',
        0.0100,
        0.025,
        true
    ),
    (
        '+971',
        'UAE',
        0.0180,
        0.04,
        true
    ),
    (
        '+52',
        'Mexico',
        0.0095,
        0.025,
        true
    ),
    (
        '+55',
        'Brazil',
        0.0110,
        0.028,
        true
    ),
    (
        '+27',
        'South Africa',
        0.0140,
        0.032,
        true
    ),
    (
        '+82',
        'South Korea',
        0.0160,
        0.038,
        true
    ),
    (
        '+39',
        'Italy',
        0.0135,
        0.031,
        true
    ),
    (
        '+34',
        'Spain',
        0.0128,
        0.03,
        true
    ),
    (
        '+31',
        'Netherlands',
        0.0122,
        0.029,
        true
    ),
    (
        '+46',
        'Sweden',
        0.0145,
        0.033,
        true
    ),
    (
        '+47',
        'Norway',
        0.0155,
        0.036,
        true
    ),
    (
        '+41',
        'Switzerland',
        0.0165,
        0.038,
        true
    )
ON CONFLICT (country_code) DO
UPDATE
SET
    country_name = EXCLUDED.country_name,
    cost_per_minute = EXCLUDED.cost_per_minute,
    sell_rate_per_minute = EXCLUDED.sell_rate_per_minute,
    is_active = EXCLUDED.is_active,
    updated_at = now ();