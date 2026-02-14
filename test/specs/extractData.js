const getTextSafely = async (selector, fieldName = "field") => {
  try {
    const element = await $(selector);

    if (!(await element.isExisting())) {
      console.log(`    ⚠️ ${fieldName} not found`);
      return "";
    }

    if (!(await element.isDisplayed())) {
      console.log(`    ⚠️ ${fieldName} not displayed`);
      return "";
    }

    const text = await element.getText();
    if (text && text.trim()) {
      console.log(`    ✅ ${fieldName}: "${text.trim().substring(0, 30)}..."`);
      return text.trim();
    } else {
      console.log(`    ⚠️ ${fieldName} is empty`);
      return "";
    }
  } catch (error) {
    console.log(`    ❌ ${fieldName} error: ${error.message}`);
    return "";
  }
};
export default async function extractVerbData2(
  verbName,
  verbTypeValue,
  labelType,
) {
  const data = {
    name: verbName,
    inputType: verbTypeValue,
    labelType: labelType || "default",
    timestamp: new Date().toISOString(),
    processed: true,
  };

  // Extract translations
  data.ar = await getTextSafely(
    "/html[1]/body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[1]/table[1]/tbody[1]/tr[1]/td[2]/div[1]",
    "Arabic translation",
  );
  data.fr = await getTextSafely(
    "/html[1]/body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[1]/table[1]/tbody[1]/tr[1]/td[1]/div[1]",
    "French translation",
  );

  // Extract all conjugation forms
  data.ao = {
    s1: {
      m: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[1]/table[1]/tbody[1]/tr[3]/td[3]",
        //'//*[@id="list"]/li[1]/table/tbody/tr[3]/td[3]',
        "AO s1 m",
      ),
      f: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[1]/table[1]/tbody[1]/tr[3]/td[4]",
        "AO s1 f",
      ),
    },
    s2: {
      m: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[1]/table[1]/tbody[1]/tr[4]/td[2]",
        "AO s2 m",
      ),
      f: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[1]/table[1]/tbody[1]/tr[4]/td[3]",
        "AO s2 f",
      ),
    },
    s3: {
      m: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[1]/table[1]/tbody[1]/tr[5]/td[2]",
        "AO s3 m",
      ),
      f: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[1]/table[1]/tbody[1]/tr[5]/td[3]",
        "AO s3 f",
      ),
    },
    p1: {
      m: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[1]/table[1]/tbody[1]/tr[6]/td[3]",
        "AO p1 m",
      ),
      f: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[1]/table[1]/tbody[1]/tr[6]/td[4]",
        "AO p1 f",
      ),
    },
    p2: {
      m: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[1]/table[1]/tbody[1]/tr[7]/td[2]",
        "AO p2 m",
      ),
      f: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[1]/table[1]/tbody[1]/tr[7]/td[3]",
        "AO p2 f",
      ),
    },
    p3: {
      m: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[1]/table[1]/tbody[1]/tr[8]/td[2]",
        "AO p3 m",
      ),
      f: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[1]/table[1]/tbody[1]/tr[8]/td[3]",
        "AO p3 f",
      ),
    },
  };

  data.acc = {
    s1: {
      m: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[2]/table[1]/tbody[1]/tr[3]/td[3]",
        "ACC s1 m",
      ),
      f: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[2]/table[1]/tbody[1]/tr[3]/td[4]",
        "ACC s1 f",
      ),
    },
    s2: {
      m: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[2]/table[1]/tbody[1]/tr[4]/td[2]",
        "ACC s2 m",
      ),
      f: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[2]/table[1]/tbody[1]/tr[4]/td[3]",
        "ACC s2 f",
      ),
    },
    s3: {
      m: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[2]/table[1]/tbody[1]/tr[5]/td[2]",
        "ACC s3 m",
      ),
      f: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[2]/table[1]/tbody[1]/tr[5]/td[3]",
        "ACC s3 f",
      ),
    },
    p1: {
      m: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[2]/table[1]/tbody[1]/tr[6]/td[3]",
        "ACC p1 m",
      ),
      f: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[2]/table[1]/tbody[1]/tr[6]/td[4]",
        "ACC p1 f",
      ),
    },
    p2: {
      m: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[2]/table[1]/tbody[1]/tr[7]/td[2]",
        "ACC p2 m",
      ),
      f: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[2]/table[1]/tbody[1]/tr[7]/td[3]",
        "ACC p2 f",
      ),
    },
    p3: {
      m: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[2]/table[1]/tbody[1]/tr[8]/td[2]",
        "ACC p3 m",
      ),
      f: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[2]/table[1]/tbody[1]/tr[8]/td[3]",
        "ACC p3 f",
      ),
    },
  };

  data.accn = {
    s1: {
      m: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[3]/table[1]/tbody[1]/tr[3]/td[3]",
        "ACCN s1 m",
      ),
      f: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[3]/table[1]/tbody[1]/tr[3]/td[4]",
        "ACCN s1 f",
      ),
    },
    s2: {
      m: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[3]/table[1]/tbody[1]/tr[4]/td[2]",
        "ACCN s2 m",
      ),
      f: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[3]/table[1]/tbody[1]/tr[4]/td[3]",
        "ACCN s2 f",
      ),
    },
    s3: {
      m: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[3]/table[1]/tbody[1]/tr[5]/td[2]",
        "ACCN s3 m",
      ),
      f: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[3]/table[1]/tbody[1]/tr[5]/td[3]",
        "ACCN s3 f",
      ),
    },
    p1: {
      m: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[3]/table[1]/tbody[1]/tr[6]/td[3]",
        "ACCN p1 m",
      ),
      f: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[3]/table[1]/tbody[1]/tr[6]/td[4]",
        "ACCN p1 f",
      ),
    },
    p2: {
      m: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[3]/table[1]/tbody[1]/tr[7]/td[2]",
        "ACCN p2 m",
      ),
      f: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[3]/table[1]/tbody[1]/tr[7]/td[3]",
        "ACCN p2 f",
      ),
    },
    p3: {
      m: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[3]/table[1]/tbody[1]/tr[8]/td[2]",
        "ACCN p3 m",
      ),
      f: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[3]/table[1]/tbody[1]/tr[8]/td[3]",
        "ACCN p3 f",
      ),
    },
  };

  data.inacc = {
    s1: {
      m: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[3]/table[1]/tbody[1]/tr[8]/td[3]",
        "INACC s1 m",
      ),
      f: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[4]/table[1]/tbody[1]/tr[3]/td[4]",
        "INACC s1 f",
      ),
    },
    s2: {
      m: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[4]/table[1]/tbody[1]/tr[4]/td[2]",
        "INACC s2 m",
      ),
      f: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[4]/table[1]/tbody[1]/tr[4]/td[3]",
        "INACC s2 f",
      ),
    },
    s3: {
      m: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[4]/table[1]/tbody[1]/tr[5]/td[2]",
        "INACC s3 m",
      ),
      f: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[4]/table[1]/tbody[1]/tr[5]/td[3]",
        "INACC s3 f",
      ),
    },
    p1: {
      m: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[4]/table[1]/tbody[1]/tr[6]/td[3]",
        "INACC p1 m",
      ),
      f: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[4]/table[1]/tbody[1]/tr[6]/td[4]",
        "INACC p1 f",
      ),
    },
    p2: {
      m: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[4]/table[1]/tbody[1]/tr[7]/td[2]",
        "INACC p2 m",
      ),
      f: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[4]/table[1]/tbody[1]/tr[7]/td[3]",
        "INACC p2 f",
      ),
    },
    p3: {
      m: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[4]/table[1]/tbody[1]/tr[8]/td[2]",
        "INACC p3 m",
      ),
      f: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[4]/table[1]/tbody[1]/tr[8]/td[3]",
        "INACC p3 f",
      ),
    },
  };

  data.imp = {
    s: {
      m: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[5]/table[1]/tbody[1]/tr[3]/td[2]",
        "IMP s m",
      ),
      f: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[5]/table[1]/tbody[1]/tr[3]/td[3]",
        "IMP s f",
      ),
    },
    p: {
      m1: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[5]/table[1]/tbody[1]/tr[4]/td[2]",
        "IMP p m1",
      ),
      m2: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[5]/table[1]/tbody[1]/tr[4]/td[2]",
        "IMP p m2",
      ),
      f: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[5]/table[1]/tbody[1]/tr[4]/td[3]",
        "IMP p f",
      ),
    },
  };

  data.impi = {
    s: {
      m: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[6]/table[1]/tbody[1]/tr[3]/td[2]",
        "IMPI s m",
      ),
      f: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[6]/table[1]/tbody[1]/tr[3]/td[3]",
        "IMPI s f",
      ),
    },
    p: {
      m1: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[6]/table[1]/tbody[1]/tr[4]/td[2]",
        "IMPI p m1",
      ),
      m2: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[6]/table[1]/tbody[1]/tr[4]/td[2]",
        "IMPI p m2",
      ),
      f: await getTextSafely(
        "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[6]/table[1]/tbody[1]/tr[4]/td[3]",
        "IMPI p f",
      ),
    },
  };

  return data;
}
