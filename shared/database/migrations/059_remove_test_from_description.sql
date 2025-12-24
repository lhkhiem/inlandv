-- Migration 059: Remove "test" text from hero section description
-- Date: 2025-01-28
-- Removes the "test" text that was accidentally added to the description

DO $$
DECLARE
  page_id_var UUID;
  hero_section_id UUID;
  current_content TEXT;
  updated_content TEXT;
BEGIN
  -- Get page_id
  SELECT id INTO page_id_var FROM pages WHERE slug = 'gioi-thieu';
  
  IF page_id_var IS NULL THEN
    RAISE EXCEPTION 'Page not found';
  END IF;
  
  -- Get hero section id and current content
  SELECT id, content INTO hero_section_id, current_content
  FROM page_sections 
  WHERE page_id = page_id_var AND section_key = 'hero';
  
  IF hero_section_id IS NULL THEN
    RAISE EXCEPTION 'Hero section not found';
  END IF;
  
  -- Parse JSON and remove "test" from description
  BEGIN
    -- Parse current content as JSON
    DECLARE
      parsed_json JSONB;
      clean_description TEXT;
    BEGIN
      parsed_json := current_content::JSONB;
      
      -- Get description and remove "test" (case insensitive, with any whitespace)
      clean_description := parsed_json->>'description';
      IF clean_description IS NOT NULL THEN
        -- Remove "test" word (case insensitive) and any trailing whitespace
        clean_description := regexp_replace(clean_description, '\s*test\s*$', '', 'i');
        clean_description := regexp_replace(clean_description, '\s*test\s+', ' ', 'gi');
        clean_description := trim(clean_description);
        
        -- Update the JSON
        parsed_json := jsonb_set(parsed_json, '{description}', to_jsonb(clean_description));
        
        -- Update the section
        UPDATE page_sections
        SET 
          content = parsed_json::TEXT,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = hero_section_id;
        
        RAISE NOTICE 'Hero section description cleaned successfully';
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Failed to parse JSON, skipping update';
    END;
  END;
END $$;

