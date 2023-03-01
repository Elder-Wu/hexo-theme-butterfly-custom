hexo.extend.filter.register('after_init', function (data) {
    const fs = require('fs');
    const path = require('path');


    function traverseDir(rootDir, category) {
        const files = fs.readdirSync(rootDir);
        files.forEach((filename) => {
            const filepath = path.join(rootDir, filename);
            if (fs.statSync(filepath).isDirectory()) {
                // hexo.log.error(`${filename}: 是目录`)
                // js是引用传递，递归时需要先拷贝数组，再开始递归。
                // 否则大家都用的同一个数组，会出现问题
                const newCategory = [...category]
                newCategory.push(filename)
                traverseDir(filepath, newCategory);
            } else if (path.extname(filepath) === '.md') {
                const content = fs.readFileSync(filepath, 'utf-8');
                const regex = /categories:[\s\S]*?(?=\n[\w-]+:|\n$)/g;
                let newContent = content.replace(regex, (match, p1, offset, string) => {
                    // 第一个文件名是"_posts","about"这些，不需要
                    const newCategory = [...category]
                    newCategory.shift()
                    //把匹配到的内容替换成新的内容
                    if (newCategory.length == 0) {
                        hexo.log.warn(`${filename}: 无分类`);
                        match = `categories:`;
                    }
                    if (newCategory.length == 1) {
                        hexo.log.warn(`${filename}: [${newCategory.toString()}]`);
                        match = `categories:\n\t- ${newCategory.toString()}`;
                    }
                    if (newCategory.length > 1) {
                        hexo.log.warn(`${filename}: [${newCategory.toString()}]`);
                        match = `categories:\n\t- [${newCategory.toString()}]`;
                    }
                    return match;
                })
                fs.writeFileSync(filepath, newContent, 'utf-8');
            }
        });
    }

    traverseDir(hexo.source_dir, []);
})