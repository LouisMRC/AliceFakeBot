module.exports = class Page
{
    constructor(pageSize)
    {
        this.pageSize = pageSize;
        this.pages = [];
        this.pages.push([]);
    }
    push(item)
    {
        if(!this.pages[this.pages.length-1].length < this.pageSize)this.pages.push([]);
        this.pages[this.pages.length-1].push(item);
    }
    getPage(pageIndex)
    {
        return this.pages[pageIndex];
    }
    getLatestPage()
    {
        return this.pages[this.pages.length-1];
    }
    get length()
    {
        return this.pages.length
    }
}
