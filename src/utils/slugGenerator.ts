export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Remove spaces, underscores and multiple - to single -
    .replace(/^-+|-+$/g, ''); // Remove them - at the beginning/end
}

/**
 * Generate a unique slug for a project.
 * @param baseSlug The initial slug generated from the project name.
 * @param ProjectModel The Project model to check for existing slugs.
 * @param excludeId An optional project ID to exclude from the uniqueness check (useful when updating).
 * @returns A promise that resolves to a unique slug string.
 */
export async function generateUniqueSlug(
  baseSlug: string,
  ProjectModel: any,
  excludeId?: number
): Promise<string> {
  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const existing = await ProjectModel.findOne({
      where: { slug },
      ...(excludeId && { where: { slug, id: { [ProjectModel.sequelize.Sequelize.Op.ne]: excludeId } } })
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}