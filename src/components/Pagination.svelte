<script>
    import Paginator from 'paginator';

    export let getPageUrl = () => '#';

    export let limit;
    export let offset
    export let count;
    let currentPage;
    let pages = [];
    $: {
      limit = limit || 20;
      offset = offset || 0;
      currentPage = Math.ceil(offset / limit) + 1;

      let paginator, pagination_info;
      paginator = new Paginator(limit, 5);
      pagination_info = paginator.build(count, currentPage);

      pages = [];
      for (let i = pagination_info.first_page; i <= pagination_info.last_page; i++) {
        pages.push({ isActive: i === currentPage, number: i, title: i });
      }

      if (pagination_info.has_previous_page) {
        pages.unshift({ isActive: false, number: pagination_info.previous_page, title: '‹' });
        pages.unshift({ isActive: false, number: 1, title: '«' });
      }

      if (pagination_info.has_next_page) {
        pages.push({ isActive: false, number: pagination_info.next_page, title: '›' });
        pages.push({ isActive: false, number: pagination_info.total_pages, title: '»' });
      }
    }
</script>

<style>
.pagination {
  list-style: none;
  padding-left: 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin: 5rem 0;
}
.pagination li {
  background-color: #ffbb00;
}
.pagination li.active {
  background-color: #ffdd77;
}
.pagination li:first-child {
  border-top-left-radius: 0.6rem;
  border-bottom-left-radius: 0.6rem;
}
.pagination li:last-child {
  border-top-right-radius: 0.6rem;
  border-bottom-right-radius: 0.6rem;
}
.pagination li a {
  display: block;
  padding: 0.5rem 1rem;
  font-weight: bold;
}
.pagination li a,
.pagination li a:hover {
  text-decoration: none;
  color: #333333;
}
</style>

<ul class="pagination">
    {#each pages as page}
        <li class:active={!!page.isActive}>
            <a href={getPageUrl(page.number - 1)}>{page.title}</a>
        </li>
    {/each}
</ul>
