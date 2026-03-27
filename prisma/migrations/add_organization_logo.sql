-- Add logo field to Organization table
ALTER TABLE "Organization" ADD COLUMN "logo" TEXT;

-- Add comment for the logo field
COMMENT ON COLUMN "Organization"."logo" IS 'URL to organization logo image';