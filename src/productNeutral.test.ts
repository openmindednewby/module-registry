import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

const PRODUCT_TERMS = new RegExp(`\\b(${['A' + 'ML', 'Proov' + 'ID', 'Ke' + 'fi', 'Zy' + 'gos'].join('|')})\\b`, 'i');
const PACKAGE_ROOT = join(__dirname, '..');
const SHIPPED_ROOT_FILES = ['README.md', 'CHANGELOG.md', 'package.json'];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return name.endsWith('.ts') && !name.endsWith('.test.ts') ? [full] : [];
  });
}

function filesNamingAProduct(files: readonly string[], read: (file: string) => string): string[] {
  return files.filter((file) => PRODUCT_TERMS.test(read(file)));
}

describe('product neutrality', () => {
  it('with a planted product name in a source file, flags that file', () => {
    const planted = { 'src/planted.ts': `export const label = '${'A' + 'ML'} cases';`, 'src/clean.ts': 'export const x = 1;' };

    const flagged = filesNamingAProduct(Object.keys(planted), (file) => planted[file as keyof typeof planted]);

    expect(flagged).toEqual(['src/planted.ts']);
  });

  it('with the shipped source, README, CHANGELOG and package.json, names no product', () => {
    const files = [...sourceFiles(__dirname), ...SHIPPED_ROOT_FILES.map((name) => join(PACKAGE_ROOT, name))];

    const flagged = filesNamingAProduct(files, (file) => readFileSync(file, 'utf8'));

    expect(files.length).toBeGreaterThan(SHIPPED_ROOT_FILES.length);
    expect(flagged).toEqual([]);
  });
});
