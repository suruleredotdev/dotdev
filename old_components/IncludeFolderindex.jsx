assign folder_root = page.path

const folders = site.static_files.map(({item}) => item.path.contains(folder_root))
{% assign wikifolders = "" | split:"" %}

for (var folder in folders) {
  tempvar = folder.path | split:"/" %}
  wikifolders = wikifolders | push:tempvar[2] %}
}

{% assign wikifolders = wikifolders | uniq | sort %}

<div id="content" class="pa3 pa5-ns mt6-l mh7-l f4 h-100">
  <h3>{{ include.title }}</h3>

  <div class="w-100 cf">
  {% for folder in wikifolders %}
    {% unless folder contains '.' or folder contains 'html' %}
      <div class="fl w-third-l w-100 mb1 mt1 pr4-l">
        <a class="link black" href="{{folder_root}}/{{folder}}/">
          <div class="content-border pa3 dim">
            {{folder}}
          </div>
        </a>
      </div>
    {% endunless %}
  {% endfor %}
  </div>
  <br>

  {% assign folder1 = site.static_files | where_exp: "item" , "item.path contains '{{folder_root}}'" | sort:"path" %}
  {% for item in folder1 %}
    {% assign tempvar = item.path | split:"/" %}
    {% if tempvar.size < 4 %}
    <li class="w-100 pv2 list-item">
      <a href="{{ item.url }}">{{item.path}}</a>
    </li>
    {% endif %}
  {% endfor %}
</div>
