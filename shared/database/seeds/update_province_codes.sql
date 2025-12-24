-- Update province codes from names to numeric codes
-- This fixes the issue where province field contains names instead of codes

-- Update properties table
UPDATE properties 
SET province = '79' 
WHERE province = 'TP.HCM';

-- Update industrial_parks table
UPDATE industrial_parks 
SET province = CASE 
  WHEN province = 'TP.HCM' THEN '79'
  WHEN province = 'Đồng Nai' THEN '75'
  WHEN province = 'Bình Dương' THEN '74'
  WHEN province = 'Hải Phòng' THEN '31'
  WHEN province = 'Hưng Yên' THEN '33'
  ELSE province
END
WHERE province IN ('TP.HCM', 'Đồng Nai', 'Bình Dương', 'Hải Phòng', 'Hưng Yên');



