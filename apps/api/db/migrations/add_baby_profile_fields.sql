ALTER TABLE babies
  ADD COLUMN IF NOT EXISTS background_image_url TEXT,
  ADD COLUMN IF NOT EXISTS relationship_label TEXT,
  ADD COLUMN IF NOT EXISTS gender TEXT;

COMMENT ON COLUMN babies.background_image_url IS '宝宝主页背景图 URL，用于资料页头图与首页顶部背景展示，可为空';
COMMENT ON COLUMN babies.relationship_label IS '档案拥有者与宝宝的关系标签，如：妈妈、爸爸、奶奶，可为空';
COMMENT ON COLUMN babies.gender IS '宝宝性别标识：boy=男宝，girl=女宝，可为空';
