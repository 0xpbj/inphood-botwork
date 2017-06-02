var levenshtein = require('fast-levenshtein');

// Source: https://authoritynutrition.com/56-different-names-for-sugar/
const sugarNames = [
  'sugar',
  'sucrose',
  'high-fructose corn syrup',
  'hfcs',
  'agave nectar',
  'beet sugar',
  'blackstrap molasses',
  'brown sugar',
  'buttered syrup',
  'cane juice crystals',
  'cane sugar',
  'cane sugar syrup',
  'caramel',
  'carob syrup',
  'castor sugar',
  'coconut sugar',
  'confectioner\'s sugar',
  'powdered sugar',
  'date sugar',
  'demarara sugar',
  'evaporated cane juice',
  'florida crystals',
  'fruit juice',
  'fruit juice concentrate',
  'golden sugar',
  'golden syrup',
  'grape sugar',
  'honey',
  'icing sugar',
  'invert sugar',
  'maple syrup',
  'molasses',
  'muscovado sugar',
  'panela sugar',
  'raw sugar',
  'refiner\'s syrup',
  'sorghum syrup',
  'sucanat',
  'treacle sugar',
  'turbinado sugar',
  'yellow sugar',
  'barley malt',
  'brown rice syrup',
  'corn syrup',
  'corn syrup solids',
  'dextrin',
  'dextrose',
  'diastatic malt',
  'ethyl maltol',
  'glucose',
  'glucose solids',
  'lactose',
  'malt syrup',
  'maltodextrin',
  'maltose',
  'rice syrup',
  'cryrstalline fructose',
  'fructose',
  'd-ribose',
  'galactose'
]

exports.indexOfSugarNames = function(messageText) {
  return sugarNames.indexOf(messageText)
}

// Iterate over all of the sugar names getting a levenshtein distance for each one
// compared to anIngredient. Return the closest matching one.
//
exports.getSugar = function(anIngredient) {
  const levThreshold = 2
  let minLev = levThreshold
  let matchingSugar = ''

  for (let sugarName of sugarNames) {
    let lev = levenshtein.get(anIngredient, sugarName)

    if (lev <= minLev) {
      minLev = lev
      matchingSugar = sugarName
    }
  }

  return matchingSugar
}

exports.getSugarFact=function() {
  const number = Math.floor(Math.random()*(66-1+1)+1);
  switch (number) {
    case 1:
      return {
        fact: 'Fact: Sugar is one of the world’s oldest ingredients. The people of New Guinea were most likely the first to domesticate sugar cane around 8000 B.C.',
        source: 'Source: Macinnis, Peter. Bittersweet: The Story of Sugar. Crows Nest, Australia: McPherson’s Printing Group, 2002.'
      }
    case 2:
      return {
        fact: 'Fact: In the 16th century, a teaspoon of sugar cost the equivalent of five dollars in London.',
        source: 'Source: Macinnis, Peter. Bittersweet: The Story of Sugar. Crows Nest, Australia: McPherson’s Printing Group, 2002.'
      }
    case 3:
      return {
        fact: 'Fact: The word “sugar” originates from the Sanskrit word sharkara, which means “material in a granule form.” In Arabic, it is sakkar; Turkish is sheker; Italian is zucchero; and Yoruba speakers in Nigeria call it suga.',
        source: 'Source: Chapman, Garry and Gary Hodges. Sugar World (Commodities). Mankato, MN: Smart Apple Media, 2011'
      }
    case 4:
      return {
        fact: 'Fact: The American Heart Association recommends that adult women eat no more than 24 grams, or 6 teaspoons, of added (beyond naturally occurring sugar) sugar and men no more than 36 grams, or 9 teaspoons, per day. The current average is over 30 teaspoons of sugar per day.',
        source: 'Source: https://www.hsph.harvard.edu/nutritionsource/carbohydrates/added-sugar-in-the-diet/'
      }
    case 5:
      return {
        fact: 'Fact: The only taste humans are born craving is sugar.',
        source: 'Source: O’Connell, Jeff. Sugar Nation: The Hidden Truth behind America’s Deadliest Habit and the Simple Way to Beat It. New York, NY: Hyperion, 2010.'
      }
    case 6:
      return {
        fact: 'Fact: The tallest sugar cube tower measured 6 feet, 10 inches and was built by Camille Courgeon of France on July 1, 2013. The tower used 2,669 cubes and was built in 2 hours and 59 minutes.',
        source: 'Source: http://www.guinnessworldrecords.com/world-records/tallest-sugar-cube-tower'
      }
    case 7:
      return {
        fact: 'Fact: In 1822, the average American ate 45 grams of sugar—which is the amount in one of today’s 12 oz. sodas—every five days. In 2012, Americans consumed 765 grams of sugar every five days.',
        source: 'Source: https://www.hsph.harvard.edu/nutritionsource/carbohydrates/added-sugar-in-the-diet/'
      }
    case 8:
      return {
        fact: 'Fact: Heinz ketchup contains 1 teaspoon of sugar in each 1 tablespoon serving.',
        source: 'Source: O’Connell, Jeff. Sugar Nation: The Hidden Truth behind America’s Deadliest Habit and the Simple Way to Beat It. New York, NY: Hyperion, 2010.'
      }
    case 9:
      return {
        fact: 'Fact: Worldwide, people consume 500 extra calories a day from sugar, which is roughly the amount of calories needed to gain a pound a week.',
        source: 'Source: http://www.huffingtonpost.com/laura-kumin/shocking-sugar-facts_b_5455137.html'
      }
    case 10:
      return {
        fact: 'Fact: Too much sugar can increase the overall risk for heart disease. In fact, sugar actually changes the muscle protein of the heart as well as the pumping mechanics of the heart.',
        source: 'Source: O’Connell, Jeff. Sugar Nation: The Hidden Truth behind America’s Deadliest Habit and the Simple Way to Beat It. New York, NY: Hyperion, 2010.'
      }
    case 11:
      return {
        fact: 'Fact: Christopher Columbus introduced sugar cane seeds to the New World, specifically to Hispaniola, on his second voyage in 1493.',
        source: 'Source: Macinnis, Peter. Bittersweet: The Story of Sugar. Crows Nest, Australia: McPherson’s Printing Group, 2002.'
      }
    case 12:
      return {
        fact: 'Fact: Excess sugar consumption has been linked to cancer production. Studies have found that high sugar intake negatively affects the survival rates in both breast cancer patients and colon cancer patients.',
        source: 'Source: http://www.huffingtonpost.com/kristin-kirkpatrick-ms-rd-ld/dangers-of-sugar_b_3658061.html'
      }
    case 13:
      return {
        fact: 'Fact: Sugar addiction may be genetic. Studies show that those who had genetic changes in a hormone called ghrelin consume more sugar (and alcohol) than those who had no gene variation.',
        source: 'Source: http://discovermagazine.com/2009/oct/30-20-things-you-didnt-know-about-sugar'
      }
    case 14:
      return {
        fact: 'Fact: Sugar and alcohol have similar toxic liver effects. Additionally, liver damage can occur even without excess calories or weight gain.',
        source: 'Source: http://www.huffingtonpost.com/kristin-kirkpatrick-ms-rd-ld/dangers-of-sugar_b_3658061.html'
      }
    case 15:
      return {
        fact: 'Fact: A 2009 study found that glucose consumption accelerated the aging of cells in the body. Additionally, a 2012 study found that excess sugar consumption was tied to deficiencies in memory and overall cognitive processing.',
        source: 'Source: http://www.huffingtonpost.com/kristin-kirkpatrick-ms-rd-ld/dangers-of-sugar_b_3658061.html'
      }
    case 16:
      return {
        fact: 'Fact: Sugar is found in unlikely places, such as tonic water, marinades, crackers, bread, fat-free dressing, and tomato sauce.',
        source: 'Source: Chapman, Garry and Gary Hodges. Sugar World (Commodities). Mankato, MN: Smart Apple Media, 2011'
      }
    case 17:
      return {
        fact: 'Fact: A 2013 study found that at least 180,000 deaths worldwide are linked to sweetened-beverage consumption. The U.S. alone accounted for 25,000 deaths in 2010.',
        source: 'Source: https://www.forbes.com/sites/alicegwalton/2012/08/30/how-much-sugar-are-americans-eating-infographic/#1c011ef64ee7'
      }
    case 18:
      return {
        fact: 'Fact: While foods rich in fiber, fat, and protein help make a person feel full, sugar does not create feelings of satiety.',
        source: 'Source: Chapman, Garry and Gary Hodges. Sugar World (Commodities). Mankato, MN: Smart Apple Media, 2011'
      }
    case 19:
      return {
        fact: 'Fact: One 20 oz. bottle of Coca Cola has 65 grams of sugar. This is the same amount of sugar in five Little Debbie Swiss Rolls.',
        source: 'Source: http://www.cnn.com/2014/07/02/health/gallery/sugar-sweetened-beverages/'
      }
    case 20:
      return {
        fact: 'Fact: A 15.2 oz. bottle of Minute Maid 100% Apple Juice contains 49 grams of sugar. This is about the same amount of sugar in 10 Oreos.',
        source: 'Source: http://www.cnn.com/2014/07/02/health/gallery/sugar-sweetened-beverages/'
      }
    case 21:
      return {
        fact: 'Fact: A 23 oz. bottle of Arizona Green Tea has about 51 grams of sugar, which is about the same as eating 20 Hershey’s Kisses.',
        source: 'Source: http://www.cnn.com/2014/07/02/health/gallery/sugar-sweetened-beverages/'
      }
    case 22:
      return {
        fact: 'Fact: A 16 oz. can of Monster Energy has 54 ounces of sugar, which is the same amount of sugar as 3.5 cups of Frosted Flakes.',
        source: 'Source: http://www.cnn.com/2014/07/02/health/gallery/sugar-sweetened-beverages/'
      }
    case 23:
      return {
        fact: 'Fact: A 32 oz. Gatorade bottle has 36 grams of sugar, which is like eating 5 Reese’s Peanut Butter Cups.',
        source: 'Source: http://www.cnn.com/2014/07/02/health/gallery/sugar-sweetened-beverages/'
      }
    case 24:
      return {
        fact: 'Fact: A Grande Starbucks Iced Flavored drink has about 28 grams of sugar, which is the same amount of sugar in 2.5 Krispy Kreme donuts.',
        source: 'Source: http://www.cnn.com/2014/07/02/health/gallery/sugar-sweetened-beverages/'
      }
    case 25:
      return {
        fact: 'Fact: Lemons have more sugar than strawberries.',
        source: 'Source: O’Connell, Jeff. Sugar Nation: The Hidden Truth behind America’s Deadliest Habit and the Simple Way to Beat It. New York, NY: Hyperion, 2010.'
      }
    case 26:
      return {
        fact: 'Fact: Sugar threatens more than thin waistlines. It has also been associated with several conditions and diseases, including type 2 diabetes, arthritis, acne, heart disease, depression, thrush/yeast infections, and cancer.',
        source: 'Source: http://www.huffingtonpost.com/kristin-kirkpatrick-ms-rd-ld/dangers-of-sugar_b_3658061.html'
      }
    case 27:
      return {
        fact: 'Fact: More than half of the 8.4 million metric tons of sugar that is produced in the United States each year comes from sugar beets.',
        source: 'Source: http://www.dhhs.nh.gov/dphs/nhp/documents/sugar.pdf'
      }
    case 28:
      return {
        fact: 'Fact: The scientists who discovered sucralose (Splenda) were trying to make an insecticide. An assistant thought he had been instructed to “taste” a sample he had been asked to “test.”',
        source: 'Source: http://discovermagazine.com/2009/oct/30-20-things-you-didnt-know-about-sugar'
      }
    case 29:
      return {
        fact: 'Fact: The sweetest compound known is called lugduname. It’s over 20,000 times sweeter than sugar.',
        source: 'Source: http://discovermagazine.com/2009/oct/30-20-things-you-didnt-know-about-sugar'
      }
    case 30:
      return {
        fact: 'Fact: Sugar is everywhere. It is the building blocks of carbohydrates, the most abundant type of organic molecules in living things. Researchers note that sugar is not necessarily a health problem, but the amount of sugar we consume is.',
        source: 'Source: http://www.cnn.com/2014/02/11/opinion/briscoe-sugar-getting-it-wrong/'
      }
    case 31:
      return {
        fact: 'Fact: One teaspoon of white sugar has 15 calories and one teaspoon of corn syrup (a type of sugar) has 20 calories. Soft drinks are responsible for most of the added sugar in the average American diet.',
        source: 'Source: http://www.cnn.com/2014/03/06/health/who-sugar-guidelines/'
      }
    case 32:
      return {
        fact: 'Fact: Two hundred years ago, the average American ate only 2 pounds of sugar a year. In 1970, Americans ate 123 pounds of sugar per year. Today the average American consumes almost 152 pounds of sugar in one year. This is equal to 3 pounds (or 6 cups) of sugar consumed in one week.',
        source: 'Source: http://www.dhhs.nh.gov/dphs/nhp/documents/sugar.pdf'
      }
    case 33:
      return {
        fact: 'Fact: The World Health Organization (WHO) recommends people consume less sugar than is found in one regular soda per day.',
        source: 'Source: http://www.cnn.com/2014/03/06/health/who-sugar-guidelines/'
      }
    case 34:
      return {
        fact: 'Fact: Just one 12 oz. can of soda a day adds enough sugar to a person’s diet to boost their odds of developing heart disease by one third.',
        source: 'Source: http://www.cnn.com/2014/03/06/health/who-sugar-guidelines/'
      }
    case 35:
      return {
        fact: 'Fact: Americans consume most sugar (33%) through regular soft drinks, followed by sugars and candy (16.1%); cakes, cookies, and pies (12.9%); fruit drinks (9.7%); dairy desserts and milk (8.6%); and other grains (5.8%).',
        source: 'Source: http://www.cnn.com/2014/07/02/health/gallery/sugar-sweetened-beverages/'
      }
    case 36:
      return {
        fact: 'Fact: One 12 oz. can of Coke has 10 teaspoons of sugar, which is more sugar than 2 frosted Pop Tarts and a Twinkie combined.',
        source: 'Source: http://www.cnn.com/2014/07/02/health/gallery/sugar-sweetened-beverages/'
      }
    case 37:
      return {
        fact: 'Fact: The average American consumes 53 gallons of soft drinks per year.',
        source: 'Source: http://www.cnn.com/2014/07/02/health/gallery/sugar-sweetened-beverages/'
      }
    case 38:
      return {
        fact: 'Fact: In the American diet, added sugar accounts for nearly 500 calories every day. This is equivalent to eating 10 strips of bacon every day.',
        source: 'Source: https://www.forbes.com/sites/alicegwalton/2012/08/30/how-much-sugar-are-americans-eating-infographic/#1c011ef64ee7'
      }
    case 39:
      return {
        fact: 'Fact: Americans eat 10 times more sugar than all other food additives—except for salt.',
        source: 'Source: Chapman, Garry and Gary Hodges. Sugar World (Commodities). Mankato, MN: Smart Apple Media, 2011'
      }
    case 40:
      return {
        fact: 'Fact: To find the amount of calories from sugar in a product, multiply the grams by 4. For example, a product containing 15 grams of sugar has 60 calories from sugar per serving.',
        source: 'Source: https://www.hsph.harvard.edu/nutritionsource/carbohydrates/added-sugar-in-the-diet/'
      }
    case 41:
      return {
        fact: 'Fact: Sugar can take several forms, including sucrose, fructose, and lactose. Sucrose is the most commonly used form of sugar and is usually called table sugar.',
        source: 'Source: http://www.cnn.com/2014/02/11/opinion/briscoe-sugar-getting-it-wrong/'
      }
    case 42:
      return {
        fact: 'Fact: The average American consumes 3 pounds of sugar each week—or 3,550 pounds in an entire lifetime. This is equivalent to about 1,767,900 Skittles, which is enough sugar to fill an industrialized dumpster.',
        source: 'Source: https://www.forbes.com/sites/alicegwalton/2012/08/30/how-much-sugar-are-americans-eating-infographic/#1c011ef64ee7'
      }
    case 43:
      return {
        fact: 'Fact: Many cereals for children, such as Fruit Loops, contain one spoonful of sugar for every three spoonfuls of cereal eaten. Often the least healthful cereals are marketed the most aggressively, even to kids as young as 2 years old.',
        source: 'Source: http://www.medicalnewstoday.com/articles/246996.php'
      }
    case 44:
      return {
        fact: 'Fact: Two different types of plants provide the world with most of its sugar: sugar cane and sugar beet. Sugar cane is grown in tropical and subtropical regions. Sugar beet is grown in temperate climates, such as parts of Europe, Japan, and the United States.',
        source: 'Source: Macinnis, Peter. Bittersweet: The Story of Sugar. Crows Nest, Australia: McPherson’s Printing Group, 2002.'
      }
    case 45:
      return {
        fact: 'Fact: About 70% of all sugar produced is used in its country of origin. More than 100 countries produce sugar commercially.',
        source: 'Source: Macinnis, Peter. Bittersweet: The Story of Sugar. Crows Nest, Australia: McPherson’s Printing Group, 2002.'
      }
    case 46:
      return {
        fact: 'Fact: Brazil is the world’s largest producer of sugar cane.',
        source: 'Source: Macinnis, Peter. Bittersweet: The Story of Sugar. Crows Nest, Australia: McPherson’s Printing Group, 2002.'
      }
    case 47:
      return {
        fact: 'Fact: India is the world’s largest consumer of sugar.',
        source: 'Source: Chapman, Garry and Gary Hodges. Sugar World (Commodities). Mankato, MN: Smart Apple Media, 2011'
      }
    case 48:
      return {
        fact: 'Fact: Sugar cane is usually grown in large plantations or cane fields. It can yield up to 44 pounds (20 kg) of sugar for every 11 square feet (1 square m) of land.',
        source: 'Source: Chapman, Garry and Gary Hodges. Sugar World (Commodities). Mankato, MN: Smart Apple Media, 2011'
      }
    case 49:
      return {
        fact: 'Fact: Sugar is useful in cooking: it helps cakes and bread rise, prevents food from spoiling, keeps the color of fruit by holding water, and brings out the flavor in many different foods.',
        source: 'Source: Macinnis, Peter. Bittersweet: The Story of Sugar. Crows Nest, Australia: McPherson’s Printing Group, 2002.'
      }
    case 50:
      return {
        fact: 'Fact: The sugar trade is one of the most complex in the world and involves price controls, quotas, subsidies, and preferential arrangements.',
        source: 'Source: Macinnis, Peter. Bittersweet: The Story of Sugar. Crows Nest, Australia: McPherson’s Printing Group, 2002.'
      }
    case 51:
      return {
        fact: 'Fact: The world sugar trade is regulated by the World Trade Organization (WTO), which helps ensure any business between the countries is conducted fairly.',
        source: 'Source: Macinnis, Peter. Bittersweet: The Story of Sugar. Crows Nest, Australia: McPherson’s Printing Group, 2002.'
      }
    case 52:
      return {
        fact: 'Fact: One of the most important agreements governing the sugar trade is the Anti-Dumping Agreement, which tries to prevent large sugar producers, such as the U.S. and Europe, from dumping their surplus sugar on the world market at low prices.',
        source: 'Source: Macinnis, Peter. Bittersweet: The Story of Sugar. Crows Nest, Australia: McPherson’s Printing Group, 2002.'
      }
    case 53:
      return {
        fact: 'Fact: There are at least 115 names for sugar in its many forms and for other types of sweeteners. To avoid listing “sugar” as the first ingredient, food manufactures may use a different name.',
        source: 'Source: http://www.huffingtonpost.com/laura-kumin/shocking-sugar-facts_b_5455137.html'
      }
    case 54:
      return {
        fact: 'Fact: Sugar has been shown to cause wrinkles via glycation, which happens when excess blood sugar binds to collagen in the skin and makes it less elastic.',
        source: 'Source: http://discovermagazine.com/2009/oct/30-20-things-you-didnt-know-about-sugar'
      }
    case 55:
      return {
        fact: 'Fact: Until the late 1500s, sugar was called “White Gold,” and European nobility used it to display their social standing. After about 1600 on, technological improvements and New World sources helped turn sugar into a bulk commodity.',
        source: 'Source: Macinnis, Peter. Bittersweet: The Story of Sugar. Crows Nest, Australia: McPherson’s Printing Group, 2002.'
      }
    case 56:
      return {
        fact: 'Fact: Four grams of sugar equal 1 teaspoon of sugar. So, for example, the cereal Cocoa Puffs has 10 grams, or 2½ teaspoons, of sugar in each ¾ cup serving.',
        source: 'Source: https://www.forbes.com/sites/alicegwalton/2012/08/30/how-much-sugar-are-americans-eating-infographic/#1c011ef64ee7'
      }
    case 57:
      return {
        fact: 'Fact: Ralf Schroder of Germany holds the Guinness World Record for the largest collection of sugar packets as of May 14, 2013. He owns 14,502 different sugar packets, the oldest of which dates back to the 1950s.',
        source: 'Source: http://www.guinnessworldrecords.com/world-records/largest-collection-of-sugar-packets/'
      }
    case 58:
      return {
        fact: 'Fact: Originally, people would chew sugar cane raw for its sweetness. Indians were the first to crystallize sugar during the Gupta dynasty around A.D. 350.',
        source: 'Source: Macinnis, Peter. Bittersweet: The Story of Sugar. Crows Nest, Australia: McPherson’s Printing Group, 2002.'
      }
    case 59:
      return {
        fact: 'Fact: Crusaders were the first to introduce sugar to Europe after they encountered caravans carrying “sweet salt.”',
        source: 'Source: Macinnis, Peter. Bittersweet: The Story of Sugar. Crows Nest, Australia: McPherson’s Printing Group, 2002.'
      }
    case 60:
      return {
        fact: 'Fact: In the United States and Japan, high-fructose corn syrup is used in place of sugar in many instances, especially in soft drinks and processed foods.',
        source: 'Source: O’Connell, Jeff. Sugar Nation: The Hidden Truth behind America’s Deadliest Habit and the Simple Way to Beat It. New York, NY: Hyperion, 2010.'
      }
    case 61:
      return {
        fact: 'Fact: When the body cannot clear glucose, or sugar, quickly enough, sugar destroys tissue. This is basically what diabetes is: the inability to eliminate glucose.',
        source: 'Source: O’Connell, Jeff. Sugar Nation: The Hidden Truth behind America’s Deadliest Habit and the Simple Way to Beat It. New York, NY: Hyperion, 2010.'
      }
    case 62:
      return {
        fact: 'Fact: The percentage of total calories from added sugars decreases linearly with increasing income for men and women. In other words, people living in poverty are more likely to eat more added sugar than their wealthier counterparts.',
        source: 'Source: https://www.cdc.gov/nchs/data/databriefs/db122.htm'
      }
    case 63:
      return {
        fact: 'Fact: Men consume a larger absolute amount of calories from added sugars than women, but not when their added sugars intakes were expressed as a percentage of total calories. The percentage of calories from added sugars declines with increasing age and income.',
        source: 'Source: https://www.cdc.gov/nchs/data/databriefs/db122.htm'
      }
    case 64:
      return {
        fact: 'Fact: According to brain scans, sugar is as addictive as cocaine.',
        source: 'Source: https://www.forbes.com/sites/alicegwalton/2012/08/30/how-much-sugar-are-americans-eating-infographic/#1c011ef64ee7'
      }
    case 65:
      return {
        fact: 'Fact: Non-Hispanic black men and women ate a larger percentage of calories from added sugars than non-Hispanic white or Mexican American men and women.',
        source: 'Source: https://www.cdc.gov/nchs/data/databriefs/db122.htm'
      }
    case 66:
      return {
        fact: 'Fact: Researchers found that people who drink 2.5 cans of sugary soda daily are three times more likely to be depressed and anxious than those who drink less.',
        source: 'Source: O’Connell, Jeff. Sugar Nation: The Hidden Truth behind America’s Deadliest Habit and the Simple Way to Beat It. New York, NY: Hyperion, 2010.'
      }
  }
}
