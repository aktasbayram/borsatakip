export function slugify(text: string): string {
    if (!text) return "";

    const trMap: { [key: string]: string } = {
        'ç': 'c', 'Ç': 'c',
        'ğ': 'g', 'Ğ': 'g',
        'ş': 's', 'Ş': 's',
        'ü': 'u', 'Ü': 'u',
        'ı': 'i', 'İ': 'i',
        'ö': 'o', 'Ö': 'o'
    };

    const stopWords = [
        "ve", "ile", "veya", "bir", "icin", "bu", "şu", "o", "mu", "mi", "mı", "mü",
        "daha", "en", "kadar", "gibi", "diye", "ise", "ki", "de", "da", "ama", "fakat",
        "lakin", "ancak", "yada", "veyahut", "her", "şey", "sey", "ne", "nasil", "niye",
        "neden", "kim", "hangi", "nerede", "nereye", "nereden"
    ];

    // 1. Transliterate Turkish characters
    let slug = text.split('').map(char => trMap[char] || char).join('');

    // 2. Lowercase and basic cleanup
    slug = slug.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric chars (keep spaces and hyphens)
        .replace(/\s+/g, ' ')         // Collapse whitespace
        .trim();

    // 3. Remove stop words (only if resulting slug is not empty)
    const words = slug.split(' ');
    const filteredWords = words.filter(word => !stopWords.includes(word));

    // If filtering removes everything, revert to original words
    const finalWords = filteredWords.length > 0 ? filteredWords : words;

    return finalWords.join('-');
}
